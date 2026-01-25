import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, UserInfo, ShippingAddress, ProfileResponse, PaginatedResponse } from '@/types/api'
import { mapBackendUserToUserInfo } from '@/utils/userMapper'
import type { User, UserFilter } from '@/features/user/userTypes'

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
  getUsers: async (filter?: UserFilter): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.USER.ALL_USERS,
      { params: filter }
    )
    return response.data
  },

  getProfile: async (): Promise<ApiResponse<UserInfo>> => {
    const response = await apiClient.get<ApiResponse<ProfileResponse>>(API_ENDPOINTS.USER.PROFILE)
    return {
      ...response.data,
      data: mapBackendUserToUserInfo(response.data.data.user),
    }
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

  updateUserStatus: async (id: string, isActive: boolean): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(
      API_ENDPOINTS.USER.UPDATE_STATUS(id),
      { isActive }
    )
    return response.data
  },
}

export default userApi
