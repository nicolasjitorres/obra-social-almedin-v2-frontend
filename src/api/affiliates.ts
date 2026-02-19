import api from '../lib/axios'
import type { Affiliate, PageResponse } from '../types'

export const getAffiliates = (page = 0, size = 10) =>
  api.get<PageResponse<Affiliate>>(`/affiliates?page=${page}&size=${size}`).then(r => r.data)

export const createAffiliate = (data: Omit<Affiliate, 'id' | 'active'> & { password: string }) =>
  api.post<Affiliate>('/affiliates', data).then(r => r.data)

export const updateAffiliate = (id: number, data: Omit<Affiliate, 'id' | 'active'> & { password: string }) =>
  api.put<Affiliate>(`/affiliates/${id}`, data).then(r => r.data)

export const deactivateAffiliate = (id: number) =>
  api.delete(`/affiliates/${id}`)