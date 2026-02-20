import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import SpecialistLayout from '../../components/layout/SpecialistLayout'
import Badge from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/axios'

const STATUS_LABELS: Record<string, string> = {
  CONFIRMADA: 'Confirmada', PENDIENTE: 'Pendiente',
  COMPLETADA: 'Completada', CANCELADA: 'Cancelada', AUSENTE: 'Ausente',
}
const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

export default function SpecialistDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['specialist-appointments', user?.userId],
    queryFn: () => api.get(`/appointments/specialist/${user?.userId}?page=0&size=500`).then(r => r.data),
    enabled: !!user?.userId,
  })

  const all: any[] = data?.content ?? []
  const today = new Date().toISOString().split('T')[0]

  const todayAppts = all
    .filter(a => a.date === today && a.status !== 'CANCELADA')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const upcoming = all
    .filter(a => a.date > today && (a.status === 'CONFIRMADA' || a.status === 'PENDIENTE'))
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 5)

  const completedTotal = all.filter(a => a.status === 'COMPLETADA').length
  const pendingTotal   = all.filter(a => a.status === 'CONFIRMADA' || a.status === 'PENDIENTE').length
  const uniquePatients = new Set(all.map(a => a.affiliateId)).size

  return (
    <SpecialistLayout>
      <div className="aff-header">
        <div className="aff-header-tag">Panel del especialista</div>
        <h1 className="aff-header-title">
          Buenos días, Dr/a. {user?.fullName?.split(' ')[0]}
        </h1>
      </div>

      {/* MÉTRICAS */}
      <div className='dashboard-metrics'>
        {[
          { label: 'Turnos hoy',   value: isLoading ? '—' : todayAppts.length, sub: 'programados' },
          { label: 'Próximos',     value: isLoading ? '—' : pendingTotal,       sub: 'confirmados' },
          { label: 'Completados',  value: isLoading ? '—' : completedTotal,     sub: 'histórico' },
          { label: 'Mis pacientes',value: isLoading ? '—' : uniquePatients,     sub: 'distintos' },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* AGENDA HOY */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div className="aff-header-tag" style={{ marginBottom: 0 }}>Agenda de hoy</div>
        <button className="btn-sm" onClick={() => navigate('/specialist/agenda')}>
          Ver agenda completa →
        </button>
      </div>

      {isLoading ? (
        <div className="empty-state">Cargando...</div>
      ) : todayAppts.length === 0 ? (
        <div className="empty-state">No tenés turnos programados para hoy.</div>
      ) : todayAppts.map((a: any) => (
        <div className="appt-card" key={a.id}>
          <div className="appt-date-box">
            <div className="appt-date-day" style={{ fontSize: '1.1rem' }}>{a.startTime?.slice(0,5)}</div>
            <div className="appt-date-month">hs</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="appt-info-name">{a.affiliateName ?? `Afiliado #${a.affiliateId}`}</div>
            <div className="appt-info-sub">
              <span>{a.startTime?.slice(0,5)} – {a.endTime?.slice(0,5)}</span>
              <span>{a.type}</span>
            </div>
          </div>
          <div className="appt-actions">
            <Badge variant={a.status} label={STATUS_LABELS[a.status] ?? a.status} />
            {(a.status === 'CONFIRMADA' || a.status === 'PENDIENTE') && (
              <button className="btn-sm primary" onClick={() => navigate('/specialist/agenda')}>
                Gestionar
              </button>
            )}
          </div>
        </div>
      ))}

      {/* PRÓXIMOS */}
      {upcoming.length > 0 && (
        <>
          <div className="aff-header-tag" style={{ margin: '2rem 0 0.75rem' }}>Próximos turnos</div>
          {upcoming.map((a: any) => {
            const [year, month, day] = a.date.split('-')
            return (
              <div className="appt-card" key={a.id}>
                <div className="appt-date-box">
                  <div className="appt-date-day">{day}</div>
                  <div className="appt-date-month">{MONTHS[parseInt(month)-1]} {year}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="appt-info-name">{a.affiliateName ?? `Afiliado #${a.affiliateId}`}</div>
                  <div className="appt-info-sub">
                    <span>{a.startTime?.slice(0,5)} – {a.endTime?.slice(0,5)}</span>
                    <span>{a.type}</span>
                  </div>
                </div>
                <Badge variant={a.status} label={STATUS_LABELS[a.status] ?? a.status} />
              </div>
            )
          })}
        </>
      )}
    </SpecialistLayout>
  )
}