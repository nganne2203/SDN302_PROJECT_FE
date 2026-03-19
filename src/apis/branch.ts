import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type {
  Branch,
  BranchFilter,
  CreateBranchPayload,
  UpdateBranchPayload
} from '@/features/branch/branchTypes'
import type { User } from '@/features/user/userTypes'

type BranchFilterAll = Omit<BranchFilter, 'page' | 'limit'>
type BranchRequestWithAddresses = (CreateBranchPayload | UpdateBranchPayload) & {
  addresses?: unknown
}

const sanitizeBranchPayload = (data: CreateBranchPayload | UpdateBranchPayload): CreateBranchPayload | UpdateBranchPayload => {
  const sanitizedPayload = { ...data } as BranchRequestWithAddresses
  delete sanitizedPayload.addresses
  return sanitizedPayload as CreateBranchPayload | UpdateBranchPayload
}

type BranchManagerFilter = {
  search?: string
  sortBy?: 'name' | 'email'
  sortOrder?: 'asc' | 'desc'
}

export const branchApi = {
  getBranches: async (filter?: BranchFilter): Promise<PaginatedResponse<Branch>> => {
    const response = await apiClient.get<PaginatedResponse<Branch>>(
      API_ENDPOINTS.BRANCH.LIST,
      { params: filter }
    )
    return response.data
  },

  getAllBranches: async (filter?: BranchFilterAll): Promise<ApiResponse<Branch[]>> => {
    const response = await apiClient.get<ApiResponse<Branch[]>>(
      API_ENDPOINTS.BRANCH.ALL,
      { params: filter }
    )
    return response.data
  },

  getBranchManagers: async (filter?: BranchManagerFilter): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      API_ENDPOINTS.BRANCH.MANAGERS,
      { params: filter }
    )
    return response.data
  },

  getBranchById: async (id: string): Promise<ApiResponse<Branch>> => {
    const response = await apiClient.get<ApiResponse<Branch>>(API_ENDPOINTS.BRANCH.DETAIL(id))
    return response.data
  },

  createBranch: async (data: CreateBranchPayload): Promise<ApiResponse<Branch>> => {
    const sanitizedData = sanitizeBranchPayload(data) as CreateBranchPayload
    const response = await apiClient.post<ApiResponse<Branch>>(API_ENDPOINTS.BRANCH.CREATE, sanitizedData)
    return response.data
  },

  updateBranch: async (id: string, data: UpdateBranchPayload): Promise<ApiResponse<Branch>> => {
    const sanitizedData = sanitizeBranchPayload(data) as UpdateBranchPayload
    const response = await apiClient.put<ApiResponse<Branch>>(API_ENDPOINTS.BRANCH.UPDATE(id), sanitizedData)
    return response.data
  },

  updateBranchStatus: async (id: string, isActive: boolean): Promise<ApiResponse<Branch>> => {
    const response = await apiClient.patch<ApiResponse<Branch>>(
      API_ENDPOINTS.BRANCH.UPDATE_STATUS(id),
      { isActive }
    )
    return response.data
  },

  assignManager: async (id: string, manager: string): Promise<ApiResponse<Branch>> => {
    const response = await apiClient.patch<ApiResponse<Branch>>(
      API_ENDPOINTS.BRANCH.ASSIGN_MANAGER(id),
      { manager }
    )
    return response.data
  },

  removeManager: async (id: string): Promise<ApiResponse<Branch>> => {
    const response = await apiClient.patch<ApiResponse<Branch>>(API_ENDPOINTS.BRANCH.REMOVE_MANAGER(id))
    return response.data
  },

  deleteBranch: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.BRANCH.DELETE(id))
    return response.data
  }
}

export const getBranches = async (filter?: BranchFilter): Promise<PaginatedResponse<Branch>> => {
  return branchApi.getBranches(filter)
}

export default branchApi
