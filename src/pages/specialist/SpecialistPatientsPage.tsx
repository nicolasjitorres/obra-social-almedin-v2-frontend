import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import SpecialistLayout from '../../components/layout/SpecialistLayout'
import SearchInput from '../../components/ui/SearchInput'
import Badge from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/axios'

const STATUS_LABELS: Record<string, string> = {
  CONFIRMADA: 'Confirmada', PENDIENTE: 'Pendiente',
  COMPLETADA: 'Completada', CANCELADA: 'Cancelada', AUSENTE: 'Ausente',
}
const TYPE_OPTIONS: Record<string, string> = {
  CONSULTA: 'Consulta', EXTRACCION: 'Extracción',
  CONTROL: 'Control', CIRUGIA: 'Cirugía', OTRO: 'Otro',
}
const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

interface Patient {
  affiliateId: number
  affiliateName: string
  appointments: any[]
  lastVisit: string
  totalVisits: number
  completedVisits: number
}

export default function SpecialistPatientsPage() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [detailTab, setDetailTab] = useState<'history' | 'notes' | 'prescriptions'>('history')

  const { data, isLoading } = useQuery({
    queryKey: ['specialist-appointments', user?.userId],
    queryFn: () => api.get(`/appointments/specialist/${user?.userId}?page=0&size=500`).then(r => r.data),
    enabled: !!user?.userId,
  })

  // Agrupar por afiliado para construir fichas de pacientes
  const patients: Patient[] = useMemo(() => {
    const all: any[] = data?.content ?? []
    const map = new Map<number, Patient>()

    all.forEach(a => {
      if (!map.has(a.affiliateId)) {
        map.set(a.affiliateId, {
          affiliateId:    a.affiliateId,
          affiliateName:  a.affiliateName ?? `Afiliado #${a.affiliateId}`,
          appointments:   [],
          lastVisit:      a.date,
          totalVisits:    0,
          completedVisits: 0,
        })
      }
      const p = map.get(a.affiliateId)!
      p.appointments.push(a)
      p.totalVisits++
      if (a.status === 'COMPLETADA') p.completedVisits++
      if (a.date > p.lastVisit) p.lastVisit = a.date
    })

    return Array.from(map.values())
      .sort((a, b) => b.lastVisit.localeCompare(a.lastVisit))
  }, [data])

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    return !q || p.affiliateName.toLowerCase().includes(q)
  })

  const sortedAppts = selectedPatient
    ? [...selectedPatient.appointments].sort((a, b) => b.date.localeCompare(a.date))
    : []

  const notesAppts        = sortedAppts.filter(a => a.clinicalNotes)
  const prescriptionAppts = sortedAppts.filter(a => a.prescription)

  return (
    <SpecialistLayout>
      <div className="aff-header">
        <div className="aff-header-tag">Seguimiento</div>
        <h1 className="aff-header-title">Mis pacientes</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '320px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LISTA DE PACIENTES */}
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar paciente..."
            />
          </div>

          {isLoading ? (
            <div className="empty-state">Cargando pacientes...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No se encontraron pacientes.</div>
          ) : filtered.map(p => {
            const [year, month, day] = p.lastVisit.split('-')
            const isSelected = selectedPatient?.affiliateId === p.affiliateId
            return (
              <div
                key={p.affiliateId}
                onClick={() => { setSelectedPatient(p); setDetailTab('history') }}
                style={{
                  padding: '1rem 1.25rem',
                  border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: isSelected ? 'var(--color-accent-soft)' : 'var(--color-bg-soft)',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--color-cream)', fontWeight: 500, marginBottom: '0.25rem' }}>
                      {p.affiliateName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                      {p.totalVisits} visita{p.totalVisits !== 1 ? 's' : ''} · {p.completedVisits} completada{p.completedVisits !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>Última visita</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-cream)' }}>
                      {day} {MONTHS[parseInt(month)-1]} {year}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* FICHA DEL PACIENTE */}
        {selectedPatient && (
          <div>
            {/* Header ficha */}
            <div style={{
              background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)',
              padding: '1.5rem', marginBottom: '1rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '0.3rem' }}>
                  Ficha del paciente
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-cream)' }}>
                  {selectedPatient.affiliateName}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center' }}>
                {[
                  { label: 'Visitas totales',    value: selectedPatient.totalVisits },
                  { label: 'Completadas',         value: selectedPatient.completedVisits },
                  { label: 'Con prescripción',    value: prescriptionAppts.length },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--color-cream)' }}>{s.value}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
              {([
                { key: 'history',       label: 'Historial de turnos' },
                { key: 'notes',         label: `Notas clínicas (${notesAppts.length})` },
                { key: 'prescriptions', label: `Prescripciones (${prescriptionAppts.length})` },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setDetailTab(tab.key)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: `2px solid ${detailTab === tab.key ? 'var(--color-accent)' : 'transparent'}`,
                    color: detailTab === tab.key ? 'var(--color-accent)' : 'var(--color-muted)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-body)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Historial */}
            {detailTab === 'history' && (
              sortedAppts.length === 0 ? (
                <div className="empty-state">Sin historial.</div>
              ) : sortedAppts.map((a: any) => {
                const [year, month, day] = a.date.split('-')
                return (
                  <div className="appt-card" key={a.id}>
                    <div className="appt-date-box">
                      <div className="appt-date-day">{day}</div>
                      <div className="appt-date-month">{MONTHS[parseInt(month)-1]} {year}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="appt-info-name">{TYPE_OPTIONS[a.type] ?? a.type}</div>
                      <div className="appt-info-sub">
                        <span>{a.startTime?.slice(0,5)} – {a.endTime?.slice(0,5)}</span>
                        {a.clinicalNotes && <span style={{ color: 'var(--color-accent)' }}>Con notas</span>}
                        {a.prescription   && <span style={{ color: 'var(--color-success)' }}>Con prescripción</span>}
                      </div>
                    </div>
                    <Badge variant={a.status} label={STATUS_LABELS[a.status] ?? a.status} />
                  </div>
                )
              })
            )}

            {/* Tab: Notas clínicas */}
            {detailTab === 'notes' && (
              notesAppts.length === 0 ? (
                <div className="empty-state">No hay notas clínicas registradas.</div>
              ) : notesAppts.map((a: any) => {
                const [year, month, day] = a.date.split('-')
                return (
                  <div key={a.id} style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', padding: '1.25rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                        {day} {MONTHS[parseInt(month)-1]} {year} · {TYPE_OPTIONS[a.type] ?? a.type}
                      </div>
                      <Badge variant={a.status} label={STATUS_LABELS[a.status] ?? a.status} />
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-cream)', lineHeight: 1.6 }}>
                      {a.clinicalNotes}
                    </p>
                  </div>
                )
              })
            )}

            {/* Tab: Prescripciones */}
            {detailTab === 'prescriptions' && (
              prescriptionAppts.length === 0 ? (
                <div className="empty-state">No hay prescripciones registradas.</div>
              ) : prescriptionAppts.map((a: any) => {
                const [year, month, day] = a.date.split('-')
                return (
                  <div key={a.id} style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', padding: '1.25rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
                      {day} {MONTHS[parseInt(month)-1]} {year} · {TYPE_OPTIONS[a.type] ?? a.type}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-cream)', lineHeight: 1.6 }}>
                      {a.prescription}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </SpecialistLayout>
  )
}