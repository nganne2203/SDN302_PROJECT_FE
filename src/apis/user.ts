import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, UserInfo, ShippingAddress } from '@/types/api'

export interface UpdateProfileRequest {
  fullName?: string
  phoneNumber?: string
  avatar?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export const userApi = {
  getProfile: async (): Promise<ApiResponse<UserInfo>> => {
    const response = await apiClient.get<ApiResponse<UserInfo>>(API_ENDPOINTS.USER.PROFILE)
    return response.data
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserInfo>> => {
    const response = await apiClient.put<ApiResponse<UserInfo>>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      data
    )
    return response.data
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.USER.CHANGE_PASSWORD,
      data
    )
    return response.data
  },

  getAddresses: async (): Promise<ApiResponse<ShippingAddress[]>> => {
    const response = await apiClient.get<ApiResponse<ShippingAddress[]>>(
      API_ENDPOINTS.USER.ADDRESSES
    )
    return response.data
  },

  addAddress: async (address: ShippingAddress): Promise<ApiResponse<ShippingAddress>> => {
    const response = await apiClient.post<ApiResponse<ShippingAddress>>(
      API_ENDPOINTS.USER.ADDRESSES,
      address
    )
    return response.data
  },
}

export default userApi
