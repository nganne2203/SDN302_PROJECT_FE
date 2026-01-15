import type { UserInfo, UserRole } from '@/types/api'

// Auth State
export interface AuthState {
  isAuthenticated: boolean
  user: UserInfo | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
}

// Auth Actions Payload Types
export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
  phoneNumber?: string
}

export interface AuthSuccessPayload {
  user: UserInfo
  accessToken: string
  refreshToken: string
}

export interface TokenPayload {
  sub: string
  email: string
  role: UserRole
  exp: number
  iat: number
}
