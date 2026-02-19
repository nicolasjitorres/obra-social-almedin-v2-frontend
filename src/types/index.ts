export type Role = 'ADMIN' | 'AFFILIATE' | 'SPECIALIST'

export interface AuthResponse {
  token: string
  role: Role
  fullName: string
  userId: number
}

export interface User {
  userId: number
  fullName: string
  role: Role
  token: string
}

export interface Affiliate {
  id: number
  firstName: string
  lastName: string
  dni: string
  email: string
  healthInsuranceCode: string
  active: boolean
}

export interface Specialist {
  id: number
  firstName: string
  lastName: string
  dni: string
  email: string
  speciality: string
  address: string
  active: boolean
}

export interface Appointment {
  id: number
  affiliateId: number
  specialistId: number
  date: string
  startTime: string
  endTime: string
  status: string
  type: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}