import type { UserInfo, UserRole, OTPType } from '@/types/api'

export interface AuthState {
  isAuthenticated: boolean
  user: UserInfo | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  // Additional state for auth flows
  pendingEmail: string | null
  otpType: OTPType | null
  isOTPModalOpen: boolean
}

export interface LoginPayload {
  email: string
  password: string
  captchaToken?: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
  phoneNumber?: string
  captchaToken?: string
}

export interface RegisterApiPayload {
  fullname: string
  email: string
  password: string
  phone?: string
  addresses?: Array<{
    fullname: string
    phone: string
    addressLine: string
    city: string
    district: string
    ward: string
    isDefault: boolean
  }>
  avatar?: string
  captchaToken?: string
}

export interface AuthSuccessPayload {
  user: UserInfo
  accessToken: string
  refreshToken: string
}

export interface TokenPayload {
  id: string
  email: string
  role: UserRole
  branch?: string | null
  exp: number
  iat: number
}

export interface VerifyOTPPayload {
  email: string
  code: string
  type: OTPType
}

export interface ResendOTPPayload {
  email: string
  type: OTPType
}

export interface ResetPasswordPayload {
  email: string
}

export interface ConfirmResetPasswordPayload {
  email: string
  newPassword: string
}

export interface SetPasswordPayload {
  password: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface RegisterSuccessPayload {
  email: string
  message: string
}

export interface VerifyOTPSuccessPayload {
  message: string
  accessToken?: string
  refreshToken?: string
  user?: UserInfo
}

export interface ResetPasswordSuccessPayload {
  email: string
  message: string
}

export interface OTPModalState {
  isOpen: boolean
  email: string
  type: OTPType
  onSuccess?: () => void
}
