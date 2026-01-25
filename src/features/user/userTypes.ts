import type { UserInfo, ShippingAddress, PaginationMeta, UserRole } from '@/types/api'

export interface UpdateProfilePayload {
  fullName?: string
  phoneNumber?: string
  avatar?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface Address {
  fullname: string
  phone: string
  addressLine: string
  city: string
  district: string
  ward: string
  isDefault: boolean
}

export interface User {
  _id: string
  fullname: string
  email: string
  role: UserRole
  phone?: string
  branch: string | null
  avatar?: string
  addresses: Address[]
  isActive: boolean
  provider?: string
  googleId?: string | null
  isEmailVerified?: boolean
  emailVerifiedAt?: string
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  updatedBy?: string | null
}

export interface UserFilter {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  role?: UserRole
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FetchUsersPayload {
  items: User[]
  pagination: PaginationMeta
}

export interface UserState {
  profile: UserInfo | null
  addresses: ShippingAddress[]
  users: User[]
  selectedUser: User | null
  pagination: PaginationMeta | null
  filter: UserFilter
  isLoading: boolean
  listLoading: boolean
  error: string | null
}