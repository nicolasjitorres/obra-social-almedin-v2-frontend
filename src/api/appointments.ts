import api from '../lib/axios'
import type { Appointment, PageResponse } from '../types'

export const getAppointments = (page = 0, size = 10, status?: string) =>
  api.get<PageResponse<Appointment>>(`/appointments?page=${page}&size=${size}${status ? `&status=${status}` : ''}`).then(r => r.data)

export const cancelAppointment = (id: number, reason: string, cancelledBy: string) =>
  api.patch(`/appointments/${id}/cancel`, { reason, cancelledBy }).then(r => r.data)