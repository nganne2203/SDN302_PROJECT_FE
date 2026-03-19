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

type UserRequestWithAddress = (CreateUserRequest | UpdateUserRequest) & {
  address?: unknown
  addresses?: Array<Record<string, unknown>>
}

const sanitizeUserPayload = (data: CreateUserRequest | UpdateUserRequest): CreateUserRequest | UpdateUserRequest => {
  const sanitizedPayload = { ...data } as UserRequestWithAddress
  const addresses = sanitizedPayload.addresses

  delete sanitizedPayload.address
  delete sanitizedPayload.addresses

  if (!addresses) {
    return sanitizedPayload as CreateUserRequest | UpdateUserRequest
  }

  const sanitizedAddresses = addresses.map((addressItem) => {
    const sanitizedAddressItem = { ...addressItem }
    delete sanitizedAddressItem.address
    return sanitizedAddressItem
  })

  return {
    ...sanitizedPayload,
    addresses: sanitizedAddresses
  } as CreateUserRequest | UpdateUserRequest
}

export interface ResetPasswordRequest {
  email: string
}

export interface ConfirmResetPasswordRequest {
  token: string
  newPassword: string
}

export interface SetPasswordRequest {
  password: string
}

export const userManageApi = {
  getUsers: async (filter?: UserManageFilter): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.USER.ALL_USERS,
      { params: filter }
    )
    return response.data
  },

  getManagerUsers: async (filter?: UserManageFilter): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.USER.GET_MANAGER,
      { params: filter }
    )
    return response.data
  },

  getCustomers: async (filter?: UserManageFilter): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.USER.GET_CUSTOMERS,
      { params: filter }
    )
    return response.data
  },

  getStaff: async (filter?: UserManageFilter): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.USER.GET_STAFF,
      { params: filter }
    )
    return response.data
  },

  createUser: async (data: CreateUserRequest): Promise<ApiResponse<User>> => {
    const sanitizedData = sanitizeUserPayload(data) as CreateUserRequest
    const response = await apiClient.post<ApiResponse<User>>(
      API_ENDPOINTS.USER.CREATE_USER,
      sanitizedData
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
    const sanitizedData = sanitizeUserPayload(data) as UpdateUserRequest
    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.USER.UPDATE(id),
      sanitizedData
    )
    return response.data
  },

  updateUserStatus: async (id: string, data: UpdateUserStatusRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(
      API_ENDPOINTS.USER.UPDATE_STATUS(id),
      data
    )
    return response.data
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.USER.RESET_PASSWORD,
      data
    )
    return response.data
  },

  confirmResetPassword: async (data: ConfirmResetPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.USER.CONFIRM_RESET_PASSWORD,
      data
    )
    return response.data
  },

  setPassword: async (data: SetPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.USER.SET_PASSWORD,
      data
    )
    return response.data
  }
}

export default userManageApi

