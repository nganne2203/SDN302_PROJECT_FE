import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type {
  ApiResponse,
  SimpleResponse,
  AuthTokens,
  RegisterResponse,
  VerifyOTPResponse,
  LoginRequest,
  RegisterRequest,
  VerifyOTPRequest,
  ResendOTPRequest,
  ResetPasswordRequest,
  ConfirmResetPasswordRequest,
  SetPasswordRequest,
  ChangePasswordRequest,
  RefreshTokenRequest
} from '@/types/api'
import { STORAGE_KEYS } from '@/constants/constant'

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthTokens>> => {
    const endpoint = data.captchaToken
      ? API_ENDPOINTS.AUTH.LOGIN
      : API_ENDPOINTS.AUTH.LOGIN_NO_CAPTCHA
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      endpoint,
      data
    )
    return response.data
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    )
    return response.data
  },

  verifyOTP: async (data: VerifyOTPRequest): Promise<ApiResponse<VerifyOTPResponse>> => {
    const response = await apiClient.post<ApiResponse<VerifyOTPResponse>>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      data
    )
    return response.data
  },

  resendOTP: async (data: ResendOTPRequest): Promise<SimpleResponse> => {
    const response = await apiClient.post<SimpleResponse>(
      API_ENDPOINTS.AUTH.RESEND_OTP,
      data
    )
    return response.data
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<SimpleResponse> => {
    const response = await apiClient.post<SimpleResponse>(
      API_ENDPOINTS.USER.RESET_PASSWORD,
      data
    )
    return response.data
  },

  confirmResetPassword: async (data: ConfirmResetPasswordRequest): Promise<SimpleResponse> => {
    const response = await apiClient.post<SimpleResponse>(
      API_ENDPOINTS.USER.CONFIRM_RESET_PASSWORD,
      data
    )
    return response.data
  },

  setPassword: async (data: SetPasswordRequest): Promise<SimpleResponse> => {
    const response = await apiClient.post<SimpleResponse>(
      API_ENDPOINTS.USER.SET_PASSWORD,
      data
    )
    return response.data
  },

  changePassword: async (data: ChangePasswordRequest): Promise<SimpleResponse> => {
    const response = await apiClient.post<SimpleResponse>(
      API_ENDPOINTS.USER.CHANGE_PASSWORD,
      data
    )
    return response.data
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<ApiResponse<AuthTokens>> => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      data
    )
    return response.data
  },

  logout: async (): Promise<SimpleResponse> => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

    if (!refreshToken) {
      throw new Error('Không tìm thấy refresh token')
    }

    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.LOGOUT,
      { refreshToken }
    )

    return response.data
  },

  logoutAll: async (): Promise<SimpleResponse> => {
    const response = await apiClient.post<SimpleResponse>(API_ENDPOINTS.AUTH.LOGOUT_ALL)
    return response.data
  }
}

export default authApi
