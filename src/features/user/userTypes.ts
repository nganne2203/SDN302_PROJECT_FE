import type { UserInfo, ShippingAddress } from '@/types/api'

export interface UserState {
  profile: UserInfo | null
  addresses: ShippingAddress[]
  isLoading: boolean
  error: string | null
}

export interface UpdateProfilePayload {
  fullName?: string
  phoneNumber?: string
  avatar?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}
