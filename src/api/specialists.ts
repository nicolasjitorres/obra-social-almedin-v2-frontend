import api from '../lib/axios'
import type { Specialist, PageResponse } from '../types'

export const getSpecialists = (page = 0, size = 10, speciality?: string) =>
  api.get<PageResponse<Specialist>>(`/specialists?page=${page}&size=${size}${speciality ? `&speciality=${speciality}` : ''}`).then(r => r.data)

export const createSpecialist = (data: Omit<Specialist, 'id' | 'active'> & { password: string }) =>
  api.post<Specialist>('/specialists', data).then(r => r.data)

export const updateSpecialist = (id: number, data: Omit<Specialist, 'id' | 'active'> & { password: string }) =>
  api.put<Specialist>(`/specialists/${id}`, data).then(r => r.data)

export const deactivateSpecialist = (id: number) =>
  api.delete(`/specialists/${id}`)