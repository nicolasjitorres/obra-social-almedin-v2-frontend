import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../../components/layout/AdminLayout'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import SearchInput from '../../components/ui/SearchInput'
import SortIcon from '../../components/ui/SortIcon'
import Table from '../../components/ui/Table'
import Toast from '../../components/ui/Toast'
import { useToast } from '../../hooks/useToast'
import api from '../../lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────
interface AffiliatePenaltyResponse {
  id: number
  affiliateId: number
  affiliateName: string
  affiliateDni: string
  appointmentId: number
  appliedAt: string
  suspendedUntil: string | null
  active: boolean
}

type SortKey = 'affiliateName' | 'affiliateDni' | 'appliedAt' | 'suspendedUntil' | 'active'
type SortDir = 'asc' | 'desc'

function formatDateTime(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function SuspendedUntilCell({ value }: { value: string | null }) {
  if (!value) return <span className="td-muted">—</span>
  const expired = new Date(value) < new Date()
  return (
    <div>
      <div style={{ color: expired ? 'var(--muted)' : '#ef4444', fontSize: '0.82rem' }}>
        {formatDateTime(value)}
      </div>
      {expired && <div className="td-muted" style={{ fontSize: '0.7rem' }}>Expirada</div>}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PenaltiesPage() {
  const qc = useQueryClient()
  const { toast, showToast } = useToast()

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'true' | 'false'>('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('appliedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [deactivateTarget, setDeactivateTarget] = useState<AffiliatePenaltyResponse | null>(null)

  const PAGE_SIZE = 10

  const { data, isLoading } = useQuery({
    queryKey: ['penalties'],
    queryFn: () => api.get('/penalties?page=0&size=500').then(r => r.data),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/penalties/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['penalties'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      showToast('Penalidad levantada correctamente', 'ok')
      setDeactivateTarget(null)
    },
    onError: () => showToast('Error al levantar la penalidad', 'err'),
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(0)
  }

  const allPenalties: AffiliatePenaltyResponse[] = data?.content ?? []

  const filtered = allPenalties
    .filter(p => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        p.affiliateName?.toLowerCase().includes(q) ||
        p.affiliateDni?.toLowerCase().includes(q)
      const matchActive =
        activeFilter === 'ALL' ||
        (activeFilter === 'true' && p.active) ||
        (activeFilter === 'false' && !p.active)
      return matchSearch && matchActive
    })
    .sort((a, b) => {
      let va = '', vb = ''
      if (sortKey === 'affiliateName')   { va = a.affiliateName ?? ''; vb = b.affiliateName ?? '' }
      if (sortKey === 'affiliateDni')    { va = a.affiliateDni ?? ''; vb = b.affiliateDni ?? '' }
      if (sortKey === 'appliedAt')       { va = a.appliedAt ?? ''; vb = b.appliedAt ?? '' }
      if (sortKey === 'suspendedUntil')  { va = a.suspendedUntil ?? ''; vb = b.suspendedUntil ?? '' }
      if (sortKey === 'active')          { va = String(a.active); vb = String(b.active) }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const activeCount = allPenalties.filter(p => p.active).length
  const expiredCount = allPenalties.filter(p => p.suspendedUntil && new Date(p.suspendedUntil) < new Date()).length

  return (
    <AdminLayout>
      <div className="adm-header">
        <div>
          <div className="adm-header-tag">Gestión</div>
          <h1 className="adm-header-title">Penalidades</h1>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="metric-card">
          <div className="metric-label">Total penalidades</div>
          <div className="metric-value">{allPenalties.length}</div>
          <div className="metric-sub">históricas</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Activas</div>
          <div className="metric-value" style={{ color: '#ef4444' }}>{activeCount}</div>
          <div className="metric-sub">afiliados suspendidos</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Expiradas</div>
          <div className="metric-value" style={{ color: 'var(--muted)' }}>{expiredCount}</div>
          <div className="metric-sub">suspensiones vencidas</div>
        </div>
      </div>

      <div className="adm-section">
        <div className="adm-section-header">
          <div className="adm-section-title">
            {filtered.length} penalidad{filtered.length !== 1 ? 'es' : ''}
          </div>
          <div className="adm-controls">
            <SearchInput
              value={search}
              onChange={v => { setSearch(v); setPage(0) }}
              placeholder="Buscar por nombre o DNI..."
            />
            <div className="status-chips">
              {(['ALL', 'true', 'false'] as const).map(f => (
                <button
                  key={f}
                  className={`chip ${activeFilter === f ? 'active' : ''}`}
                  onClick={() => { setActiveFilter(f); setPage(0) }}
                >
                  {f === 'ALL' ? 'Todas' : f === 'true' ? 'Activas' : 'Levantadas'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Table
          rowKey={p => p.id}
          isLoading={isLoading}
          data={paginated}
          columns={[
            {
              key: 'affiliate',
              header: <span onClick={() => handleSort('affiliateName')} style={{ cursor: 'pointer' }}>Afiliado <SortIcon col="affiliateName" sortKey={sortKey} sortDir={sortDir} /></span>,
              render: p => (
                <>
                  <div>{p.affiliateName}</div>
                  <div className="td-muted">DNI {p.affiliateDni}</div>
                </>
              ),
            },
            {
              key: 'appointment',
              header: 'Turno',
              render: p => <span className="td-muted">#{p.appointmentId}</span>,
            },
            {
              key: 'appliedAt',
              header: <span onClick={() => handleSort('appliedAt')} style={{ cursor: 'pointer' }}>Aplicada <SortIcon col="appliedAt" sortKey={sortKey} sortDir={sortDir} /></span>,
              render: p => <span className="td-muted">{formatDateTime(p.appliedAt)}</span>,
            },
            {
              key: 'suspendedUntil',
              header: <span onClick={() => handleSort('suspendedUntil')} style={{ cursor: 'pointer' }}>Suspendido hasta <SortIcon col="suspendedUntil" sortKey={sortKey} sortDir={sortDir} /></span>,
              render: p => <SuspendedUntilCell value={p.suspendedUntil} />,
            },
            {
              key: 'active',
              header: <span onClick={() => handleSort('active')} style={{ cursor: 'pointer' }}>Estado <SortIcon col="active" sortKey={sortKey} sortDir={sortDir} /></span>,
              render: p => <Badge variant={p.active ? 'AUSENTE' : 'active'} label={p.active ? 'Activa' : 'Levantada'} />,
            },
            {
              key: 'acciones',
              header: 'Acciones',
              render: p => p.active ? (
                <button className="btn-icon danger" onClick={() => setDeactivateTarget(p)}>
                  Levantar
                </button>
              ) : <span className="td-muted">—</span>,
            },
          ]}
        />

        <Pagination
          page={page}
          totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>

      {deactivateTarget && (
        <ConfirmDialog
          title="Levantar penalidad"
          message={`¿Levantar la penalidad de ${deactivateTarget.affiliateName} (DNI ${deactivateTarget.affiliateDni})? El afiliado podrá volver a reservar turnos.`}
          confirmLabel="Levantar penalidad"
          onConfirm={() => deactivateMutation.mutate(deactivateTarget.id)}
          onCancel={() => setDeactivateTarget(null)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => {}} />}
    </AdminLayout>
  )
}