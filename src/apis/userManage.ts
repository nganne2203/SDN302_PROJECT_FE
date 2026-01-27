import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type {
  ApiResponse,
  PaginatedResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserManageFilter
} from '@/types/api'
import type { User } from '@/features/user/userTypes'

export const userManageApi = {
  getUsers: async (filter?: UserManageFilter): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.USER.ALL_USERS,
      { params: filter }
    )
    return response.data
  },

  createUser: async (data: CreateUserRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>(
      API_ENDPOINTS.USER.CREATE_USER,
      data
    )
    return response.data
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.USER.DETAIL(id)
    )
    return response.data
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.USER.UPDATE(id),
      data
    )
    return response.data
  },

  updateUserStatus: async (id: string, data: UpdateUserStatusRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.USER.UPDATE_STATUS(id),
      data
    )
    return response.data
  }
}

export default userManageApi
