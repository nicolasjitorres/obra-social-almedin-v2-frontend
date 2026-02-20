import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import SpecialistLayout from '../../components/layout/SpecialistLayout'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Badge from '../../components/ui/Badge'
import Table from '../../components/ui/Table'
import Toast from '../../components/ui/Toast'
import { useToast } from '../../hooks/useToast'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/axios'

const DAYS_OF_WEEK = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO']
const DAY_LABELS: Record<string, string> = {
  LUNES:'Lunes', MARTES:'Martes', MIERCOLES:'Miércoles',
  JUEVES:'Jueves', VIERNES:'Viernes', SABADO:'Sábado', DOMINGO:'Domingo',
}

const scheduleSchema = z.object({
  dayOfWeek:    z.string().min(1, 'Requerido'),
  startTime:    z.string().min(1, 'Requerido'),
  endTime:      z.string().min(1, 'Requerido'),
  slotDuration: z.coerce.number().min(10).max(120),
})
type ScheduleForm = z.infer<typeof scheduleSchema>

const unavailSchema = z.object({
  dateFrom:  z.string().min(1, 'Requerido'),
  dateTo:    z.string().optional(),
  startTime: z.string().optional(),
  endTime:   z.string().optional(),
  reason:    z.string().min(1, 'Requerido'),
})
type UnavailForm = z.infer<typeof unavailSchema>

function ScheduleFormModal({ schedule, onClose, onSuccess }: { schedule: any; onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const isEdit = !!schedule

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema) as any,
    defaultValues: schedule ? {
      dayOfWeek:    schedule.dayOfWeek,
      startTime:    schedule.startTime?.slice(0,5),
      endTime:      schedule.endTime?.slice(0,5),
      slotDuration: schedule.slotDuration,
    } : { slotDuration: 30 },
  })

  const onSubmit = async (data: ScheduleForm) => {
    const body = { specialistId: user?.userId, dayOfWeek: data.dayOfWeek, startTime: data.startTime + ':00', endTime: data.endTime + ':00', slotDuration: data.slotDuration }
    isEdit ? await api.put(`/schedules/${schedule.id}`, body) : await api.post('/schedules', body)
    qc.invalidateQueries({ queryKey: ['my-schedules'] })
    onSuccess()
  }

  return (
    <Modal title={isEdit ? 'Editar horario' : 'Nuevo horario'} onClose={onClose} maxWidth={460}
      footer={<><button className="btn-secondary" onClick={onClose}>Cancelar</button><button className="btn-primary" form="sched-form" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}</button></>}
    >
      <form id="sched-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label className="form-label">Día</label>
          <select {...register('dayOfWeek')} className={`form-select ${errors.dayOfWeek ? 'err' : ''}`}>
            <option value="">Seleccionar...</option>
            {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Hora inicio</label>
            <input {...register('startTime')} type="time" className={`form-input ${errors.startTime ? 'err' : ''}`} />
          </div>
          <div className="form-group">
            <label className="form-label">Hora fin</label>
            <input {...register('endTime')} type="time" className={`form-input ${errors.endTime ? 'err' : ''}`} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Duración del slot</label>
          <select {...register('slotDuration')} className="form-select">
            {[10,15,20,30,45,60,90,120].map(m => <option key={m} value={m}>{m} min</option>)}
          </select>
        </div>
      </form>
    </Modal>
  )
}

function UnavailModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UnavailForm>({
    resolver: zodResolver(unavailSchema),
  })

  const onSubmit = async (data: UnavailForm) => {
    await api.post('/unavailability', {
      specialistId: user?.userId,
      dateFrom:  data.dateFrom,
      dateTo:    data.dateTo || null,
      startTime: data.startTime ? data.startTime + ':00' : null,
      endTime:   data.endTime  ? data.endTime  + ':00' : null,
      reason:    data.reason,
    })
    qc.invalidateQueries({ queryKey: ['my-unavailability'] })
    onSuccess()
  }

  return (
    <Modal title="Registrar no disponibilidad" onClose={onClose} maxWidth={480}
      footer={<><button className="btn-secondary" onClick={onClose}>Cancelar</button><button className="btn-primary" form="unavail-form" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Registrar'}</button></>}
    >
      <form id="unavail-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Desde</label>
            <input {...register('dateFrom')} type="date" className={`form-input ${errors.dateFrom ? 'err' : ''}`} />
            {errors.dateFrom && <p className="form-error">{errors.dateFrom.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Hasta (opcional)</label>
            <input {...register('dateTo')} type="date" className="form-input" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Hora inicio (opcional)</label>
            <input {...register('startTime')} type="time" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Hora fin (opcional)</label>
            <input {...register('endTime')} type="time" className="form-input" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Motivo</label>
          <input {...register('reason')} className={`form-input ${errors.reason ? 'err' : ''}`} placeholder="Vacaciones, capacitación, consulta externa..." />
          {errors.reason && <p className="form-error">{errors.reason.message}</p>}
        </div>
      </form>
    </Modal>
  )
}

export default function SpecialistSchedulesPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const { toast, showToast } = useToast()

  const [scheduleModal, setScheduleModal] = useState(false)
  const [editSchedule, setEditSchedule]   = useState<any>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<any>(null)
  const [unavailModal, setUnavailModal]   = useState(false)
  const [deleteUnavail, setDeleteUnavail] = useState<any>(null)
  const [activeTab, setActiveTab]         = useState<'schedules' | 'unavailability'>('schedules')

  const { data: schedules, isLoading: loadSched } = useQuery<any[]>({
    queryKey: ['my-schedules', user?.userId],
    queryFn: () => api.get(`/schedules/specialist/${user?.userId}`).then(r => r.data),
    enabled: !!user?.userId,
  })

  const { data: unavailability, isLoading: loadUnavail } = useQuery<any[]>({
    queryKey: ['my-unavailability', user?.userId],
    queryFn: () => api.get(`/unavailability/specialist/${user?.userId}`).then(r => r.data),
    enabled: !!user?.userId,
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/schedules/${id}/deactivate`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-schedules'] }); showToast('Horario desactivado', 'ok'); setDeactivateTarget(null) },
    onError: () => showToast('Error al desactivar', 'err'),
  })

  const deleteUnavailMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/unavailability/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-unavailability'] }); showToast('No disponibilidad eliminada', 'ok'); setDeleteUnavail(null) },
    onError: () => showToast('Error al eliminar', 'err'),
  })

  const sortedSchedules = [...(schedules ?? [])].sort(
    (a, b) => DAYS_OF_WEEK.indexOf(a.dayOfWeek) - DAYS_OF_WEEK.indexOf(b.dayOfWeek)
  )

  return (
    <SpecialistLayout>
      <div className="aff-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="aff-header-tag">Configuración</div>
          <h1 className="aff-header-title">Mis horarios</h1>
        </div>
        <button
          className="btn-primary"
          onClick={() => activeTab === 'schedules' ? (setEditSchedule(null), setScheduleModal(true)) : setUnavailModal(true)}
        >
          + {activeTab === 'schedules' ? 'Nuevo horario' : 'Registrar no disponibilidad'}
        </button>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
        {([
          { key: 'schedules',      label: 'Horarios de atención' },
          { key: 'unavailability', label: `No disponibilidad (${unavailability?.length ?? 0})` },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '0.75rem 1.25rem', background: 'none', border: 'none',
            borderBottom: `2px solid ${activeTab === tab.key ? 'var(--color-accent)' : 'transparent'}`,
            color: activeTab === tab.key ? 'var(--color-accent)' : 'var(--color-muted)',
            fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* HORARIOS */}
      {activeTab === 'schedules' && (
        <div className="adm-section">
          <Table
            rowKey={s => s.id}
            isLoading={loadSched}
            data={sortedSchedules}
            columns={[
              { key: 'day',    header: 'Día',    render: s => DAY_LABELS[s.dayOfWeek] ?? s.dayOfWeek },
              { key: 'hours',  header: 'Horario', render: s => (
                <><div>{s.startTime?.slice(0,5)} – {s.endTime?.slice(0,5)}</div>
                <div className="td-muted">{Math.floor(((parseInt(s.endTime)-parseInt(s.startTime))*60)/s.slotDuration)} turnos aprox.</div></>
              )},
              { key: 'slot',   header: 'Slot',   render: s => <span className="td-muted">{s.slotDuration} min</span> },
              { key: 'estado', header: 'Estado', render: s => <Badge variant={s.active ? 'active' : 'inactive'} label={s.active ? 'Activo' : 'Inactivo'} /> },
              { key: 'acciones', header: 'Acciones', render: s => (
                <div className="action-btns">
                  <button className="btn-icon" onClick={() => { setEditSchedule(s); setScheduleModal(true) }}>Editar</button>
                  {s.active && <button className="btn-icon danger" onClick={() => setDeactivateTarget(s)}>Desactivar</button>}
                </div>
              )},
            ]}
          />
        </div>
      )}

      {/* NO DISPONIBILIDAD */}
      {activeTab === 'unavailability' && (
        <div className="adm-section">
          <Table
            rowKey={u => u.id}
            isLoading={loadUnavail}
            data={unavailability ?? []}
            columns={[
              { key: 'dates',  header: 'Período', render: u => (
                <><div>{u.dateFrom}{u.dateTo ? ` → ${u.dateTo}` : ''}</div>
                {u.startTime && <div className="td-muted">{u.startTime?.slice(0,5)} – {u.endTime?.slice(0,5)}</div>}</>
              )},
              { key: 'reason', header: 'Motivo', render: u => <span className="td-muted">{u.reason}</span> },
              { key: 'acciones', header: 'Acciones', render: u => (
                <button className="btn-icon danger" onClick={() => setDeleteUnavail(u)}>Eliminar</button>
              )},
            ]}
          />
        </div>
      )}

      {scheduleModal && (
        <ScheduleFormModal
          schedule={editSchedule}
          onClose={() => { setScheduleModal(false); setEditSchedule(null) }}
          onSuccess={() => { setScheduleModal(false); setEditSchedule(null); showToast(editSchedule ? 'Horario actualizado' : 'Horario creado', 'ok') }}
        />
      )}
      {unavailModal && (
        <UnavailModal
          onClose={() => setUnavailModal(false)}
          onSuccess={() => { setUnavailModal(false); showToast('No disponibilidad registrada', 'ok') }}
        />
      )}
      {deactivateTarget && (
        <ConfirmDialog
          title="Desactivar horario"
          message={`¿Desactivar el horario del ${DAY_LABELS[deactivateTarget.dayOfWeek]}?`}
          confirmLabel="Desactivar"
          onConfirm={() => deactivateMutation.mutate(deactivateTarget.id)}
          onCancel={() => setDeactivateTarget(null)}
        />
      )}
      {deleteUnavail && (
        <ConfirmDialog
          title="Eliminar no disponibilidad"
          message={`¿Eliminar el período de no disponibilidad del ${deleteUnavail.dateFrom}?`}
          confirmLabel="Eliminar"
          onConfirm={() => deleteUnavailMutation.mutate(deleteUnavail.id)}
          onCancel={() => setDeleteUnavail(null)}
        />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => {}} />}
    </SpecialistLayout>
  )
}