import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, UserInfo, ShippingAddress } from '@/types/api'
import { mapBackendUserToUserInfo } from '@/utils/mapUser'

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
    // BE: GET /auth/profile -> { data: { user: {...} } }
    const response = await apiClient.get<ApiResponse<{ user: any }>>(API_ENDPOINTS.AUTH.PROFILE)
    return {
      ...response.data,
      data: mapBackendUserToUserInfo(response.data?.data?.user),
    }
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserInfo>> => {
    // BE: PUT /users/me (expects fields like fullname/phone/avatar)
    const payload: Record<string, unknown> = {}
    if (data.fullName !== undefined) payload.fullname = data.fullName
    if (data.phoneNumber !== undefined) payload.phone = data.phoneNumber
    if (data.avatar !== undefined) payload.avatar = data.avatar

    const response = await apiClient.put<ApiResponse<any>>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      payload
    )

    return {
      ...response.data,
      data: mapBackendUserToUserInfo(response.data?.data),
    }
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
