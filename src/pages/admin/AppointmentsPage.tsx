import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AdminLayout from '../../components/layout/AdminLayout'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import SearchInput from '../../components/ui/SearchInput'
import SortIcon from '../../components/ui/SortIcon'
import Table from '../../components/ui/Table'
import Toast from '../../components/ui/Toast'
import { useToast } from '../../hooks/useToast'
import api from '../../lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────
interface AppointmentResponse {
  id: number
  affiliateId: number
  affiliateName: string
  specialistId: number
  specialistName: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  type: string
  status: string
  cancelledBy: string | null
  cancellationReason: string | null
  clinicalNotes: string | null
  prescription: string | null
  penaltyApplied: boolean
  reminderSent: boolean
  createdAt: string
  parentAppointmentId: number | null
}

type SortKey = 'date' | 'affiliateName' | 'specialistName' | 'type' | 'status'
type SortDir = 'asc' | 'desc'

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada',
  COMPLETADA: 'Completada', CANCELADA: 'Cancelada', AUSENTE: 'Ausente',
}

const TYPE_LABELS: Record<string, string> = {
  CONSULTA: 'Consulta', EXTRACCION: 'Extracción',
  CONTROL: 'Control', CIRUGIA: 'Cirugía', OTRO: 'Otro',
}

// ─── Cancel Form ──────────────────────────────────────────────────────────────
const cancelSchema = z.object({
  reason: z.string().min(1, 'El motivo es requerido'),
  cancelledBy: z.enum(['ADMIN', 'AFFILIATE', 'SPECIALIST']),
})
type CancelFormData = z.infer<typeof cancelSchema>

function CancelModal({
  appointment,
  onClose,
  onSuccess,
}: {
  appointment: AppointmentResponse
  onClose: () => void
  onSuccess: () => void
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
    defaultValues: { cancelledBy: 'ADMIN' },
  })

  const onSubmit = async (data: CancelFormData) => {
    await api.patch(`/appointments/${appointment.id}/cancel`, data)
    onSuccess()
  }

  return (
    <Modal
      title="Cancelar turno"
      onClose={onClose}
      maxWidth={480}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Volver</button>
          <button className="btn-danger" form="cancel-form" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Cancelando...' : 'Confirmar cancelación'}
          </button>
        </>
      }
    >
      <form id="cancel-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: '1rem', padding: '0.85rem 1rem', background: 'rgba(201,168,76,0.05)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginBottom: '0.3rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Turno</div>
          <div style={{ color: 'var(--color-cream)', fontSize: '0.88rem' }}>
            {appointment.affiliateName} → {appointment.specialistName}
          </div>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
            {appointment.date} · {appointment.startTime?.slice(0, 5)} · {TYPE_LABELS[appointment.type] ?? appointment.type}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Cancelado por</label>
          <select {...register('cancelledBy')} className="form-select">
            <option value="ADMIN">Administración</option>
            <option value="AFFILIATE">Afiliado</option>
            <option value="SPECIALIST">Especialista</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Motivo</label>
          <textarea
            {...register('reason')}
            rows={3}
            placeholder="Describí el motivo de la cancelación..."
            className={`form-input ${errors.reason ? 'err' : ''}`}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
          {errors.reason && <p className="form-error">{errors.reason.message}</p>}
        </div>
      </form>
    </Modal>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ appointment, onClose }: { appointment: AppointmentResponse; onClose: () => void }) {
  const Field = ({ label, value }: { label: string; value?: string | number | boolean | null }) => (
    value != null && value !== '' ? (
      <div style={{ marginBottom: '0.85rem' }}>
        <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.3rem' }}>{label}</div>
        <div style={{ color: 'var(--color-cream)', fontSize: '0.88rem', lineHeight: 1.5 }}>{String(value)}</div>
      </div>
    ) : null
  )

  return (
    <Modal title={`Turno #${appointment.id}`} onClose={onClose} maxWidth={520}
      footer={<button className="btn-secondary" onClick={onClose}>Cerrar</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
        <Field label="Afiliado" value={appointment.affiliateName} />
        <Field label="Especialista" value={appointment.specialistName} />
        <Field label="Fecha" value={appointment.date} />
        <Field label="Horario" value={`${appointment.startTime?.slice(0, 5)} – ${appointment.endTime?.slice(0, 5)}`} />
        <Field label="Tipo" value={TYPE_LABELS[appointment.type] ?? appointment.type} />
        <Field label="Estado" value={STATUS_LABELS[appointment.status] ?? appointment.status} />
        <Field label="Duración" value={`${appointment.durationMinutes} min`} />
        <Field label="Penalidad aplicada" value={appointment.penaltyApplied ? 'Sí' : 'No'} />
        {appointment.cancelledBy && <Field label="Cancelado por" value={appointment.cancelledBy} />}
        {appointment.cancellationReason && <Field label="Motivo cancelación" value={appointment.cancellationReason} />}
      </div>
      {appointment.clinicalNotes && (
        <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <Field label="Notas clínicas" value={appointment.clinicalNotes} />
        </div>
      )}
      {appointment.prescription && <Field label="Prescripción" value={appointment.prescription} />}
    </Modal>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AppointmentsPage() {
  const qc = useQueryClient()
  const { toast, showToast } = useToast()

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [cancelTarget, setCancelTarget] = useState<AppointmentResponse | null>(null)
  const [detailTarget, setDetailTarget] = useState<AppointmentResponse | null>(null)

  const PAGE_SIZE = 10

  const { data, isLoading } = useQuery({
    queryKey: ['appointments-page'],
    queryFn: () => api.get('/appointments?page=0&size=500').then(r => r.data),
  })

  const allAppointments: AppointmentResponse[] = data?.content ?? []

  const filtered = useMemo(() => {
    let rows = [...allAppointments]
    if (statusFilter !== 'ALL') rows = rows.filter(r => r.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        r.affiliateName?.toLowerCase().includes(q) ||
        r.specialistName?.toLowerCase().includes(q)
      )
    }
    rows.sort((a, b) => {
      let va = '', vb = ''
      if (sortKey === 'date')           { va = a.date + a.startTime; vb = b.date + b.startTime }
      if (sortKey === 'affiliateName')  { va = a.affiliateName ?? ''; vb = b.affiliateName ?? '' }
      if (sortKey === 'specialistName') { va = a.specialistName ?? ''; vb = b.specialistName ?? '' }
      if (sortKey === 'type')           { va = a.type; vb = b.type }
      if (sortKey === 'status')         { va = a.status; vb = b.status }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
    return rows
  }, [allAppointments, statusFilter, search, sortKey, sortDir])

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(0)
  }

  return (
    <AdminLayout>
      <div className="adm-header">
        <div>
          <div className="adm-header-tag">Gestión</div>
          <h1 className="adm-header-title">Turnos</h1>
        </div>
      </div>

      <div className="adm-section">
        <div className="adm-section-header">
          <div className="adm-section-title">
            {filtered.length} turno{filtered.length !== 1 ? 's' : ''}
          </div>
          <div className="adm-controls">
            <SearchInput
              value={search}
              onChange={v => { setSearch(v); setPage(0) }}
              placeholder="Buscar afiliado o especialista..."
            />
            <div className="status-chips">
              {['ALL', 'PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'AUSENTE'].map(s => (
                <button
                  key={s}
                  className={`chip ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => { setStatusFilter(s); setPage(0) }}
                >
                  {s === 'ALL' ? 'Todos' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Table
          rowKey={a => a.id}
          isLoading={isLoading}
          data={paginated}
          columns={[
            {
              key: 'date',
              header: <span onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>Fecha / Hora <SortIcon col="date" sortKey={sortKey} sortDir={sortDir} /></span>,
              render: a => (
                <>
                  <div>{a.date}</div>
                  <div className="td-muted">{a.startTime?.slice(0, 5)} – {a.endTime?.slice(0, 5)}</div>
                </>
              ),
            },
            {
              key: 'affiliate',
              header: <span onClick={() => handleSort('affiliateName')} style={{ cursor: 'pointer' }}>Afiliado <SortIcon col="affiliateName" sortKey={sortKey} sortDir={sortDir} /></span>,
              render: a => a.affiliateName ?? <span className="td-muted">—</span>,
            },
            {
              key: 'specialist',
              header: <span onClick={() => handleSort('specialistName')} style={{ cursor: 'pointer' }}>Especialista <SortIcon col="specialistName" sortKey={sortKey} sortDir={sortDir} /></span>,
              render: a => a.specialistName ?? <span className="td-muted">—</span>,
            },
            {
              key: 'type',
              header: <span onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>Tipo <SortIcon col="type" sortKey={sortKey} sortDir={sortDir} /></span>,
              render: a => <span className="td-muted">{TYPE_LABELS[a.type] ?? a.type}</span>,
            },
            {
              key: 'status',
              header: <span onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Estado <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} /></span>,
              render: a => <Badge variant={a.status} label={STATUS_LABELS[a.status] ?? a.status} />,
            },
            {
              key: 'acciones',
              header: 'Acciones',
              render: a => (
                <div className="action-btns">
                  <button className="btn-icon" onClick={() => setDetailTarget(a)}>Ver</button>
                  {(a.status === 'PENDIENTE' || a.status === 'CONFIRMADA') && (
                    <button className="btn-icon danger" onClick={() => setCancelTarget(a)}>Cancelar</button>
                  )}
                </div>
              ),
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

      {cancelTarget && (
        <CancelModal
          appointment={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['appointments-page'] })
            qc.invalidateQueries({ queryKey: ['appointments-all'] })
            qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
            setCancelTarget(null)
            showToast('Turno cancelado correctamente', 'ok')
          }}
        />
      )}

      {detailTarget && (
        <DetailModal
          appointment={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => {}} />}
    </AdminLayout>
  )
}