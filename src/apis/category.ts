import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type {
  ApiResponse,
  PaginatedResponse
} from '@/types/api'
import type { Category, CategoryFilter, CreateCategoryPayload } from '@/features/category/categoryTypes'

export const categoryApi = {
  getCategories: async (filter?: CategoryFilter): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get<PaginatedResponse<Category>>(
      API_ENDPOINTS.CATEGORY.LIST,
      { params: filter }
    )
    return response.data
  },

  getCategoryById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await apiClient.get<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORY.DETAIL(id)
    )
    return response.data
  },

  createCategory: async (data: CreateCategoryPayload): Promise<ApiResponse<Category>> => {
    const response = await apiClient.post<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORY.CREATE,
      data
    )
    return response.data
  },

  updateCategory: async (id: string, data: CreateCategoryPayload): Promise<ApiResponse<Category>> => {
    const response = await apiClient.put<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORY.UPDATE(id),
      data
    )
    return response.data
  },

  deleteCategory: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.CATEGORY.DELETE(id)
    )
    return response.data
  },

  updateCategoryStatus: async (id: string, isActive: boolean): Promise<ApiResponse<Category>> => {
    const response = await apiClient.patch<ApiResponse<Category>>(
      API_ENDPOINTS.CATEGORY.UPDATE_STATUS(id),
      { isActive }
    )
    return response.data
  }
}

export default categoryApi
