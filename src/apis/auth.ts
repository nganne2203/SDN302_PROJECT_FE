import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { 
  ApiResponse, 
  AuthTokens,
  SimpleResponse,
  LoginRequest, 
  RegisterRequest,
  VerifyOTPRequest,
  ResendOTPRequest
} from '@/types/api'

export const authApi = {
  // Backend returns tokens only; user must be fetched via /auth/profile
  login: async (data: LoginRequest): Promise<ApiResponse<AuthTokens>> => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    )
    return response.data
  },

  // Backend returns created user (no tokens) + message
  register: async (data: RegisterRequest): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    )
    return response.data
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(API_ENDPOINTS.AUTH.LOGOUT)
    return response.data
  },

  logoutAll: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(API_ENDPOINTS.AUTH.LOGOUT_ALL)
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthTokens>> => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken }
    )
    return response.data
  },

  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    )
    return response.data
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, newPassword }
    )
    return response.data
  },

  verifyOTP: async (data: VerifyOTPRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      data
    )
    return response.data
  },

  resendOTP: async (data: ResendOTPRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.AUTH.RESEND_OTP,
      data
    )
    return response.data
  },

  setPassword: async (password: string): Promise<SimpleResponse> => {
    const response = await apiClient.post<SimpleResponse>(
      API_ENDPOINTS.AUTH.SET_PASSWORD,
      { password }
    )
    return response.data
  },
}

export default authApi
