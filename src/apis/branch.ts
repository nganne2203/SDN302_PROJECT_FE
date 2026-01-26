import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { Branch, BranchFilter } from '@/types/api'

export interface GetBranchesResponse {
  success: boolean
  message: string
  data: Branch[]
  pagination: {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems: number
  }
}

export const getBranches = async (filter?: BranchFilter): Promise<GetBranchesResponse> => {
  const params = new URLSearchParams()
  
  if (filter?.page) params.append('page', filter.page.toString())
  if (filter?.limit) params.append('limit', filter.limit.toString())
  if (filter?.search) params.append('search', filter.search)
  if (filter?.isActive !== undefined) params.append('isActive', filter.isActive.toString())
  
  const response = await apiClient.get<GetBranchesResponse>(
    `${API_ENDPOINTS.BRANCH.LIST}?${params.toString()}`
  )
  return response.data
}
