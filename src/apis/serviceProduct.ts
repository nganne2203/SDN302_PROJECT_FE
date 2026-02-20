import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { ServiceProduct, ServiceProductFilter, CreateServiceProductRequest, UpdateServiceProductRequest } from '@/features/serviceProduct/serviceProductTypes'

export const serviceProductApi = {
  getServices: async (params?: ServiceProductFilter): Promise<PaginatedResponse<ServiceProduct>> => {
    const response = await apiClient.get<PaginatedResponse<ServiceProduct>>(
      API_ENDPOINTS.SERVICE.LIST,
      { params }
    )
    return response.data
  },

  createService: async (data: CreateServiceProductRequest): Promise<ApiResponse<ServiceProduct>> => {
    const response = await apiClient.post<ApiResponse<ServiceProduct>>(
      API_ENDPOINTS.SERVICE.CREATE,
      data
    )
    return response.data
  },

  getServiceById: async (id: string): Promise<ApiResponse<ServiceProduct>> => {
    const response = await apiClient.get<ApiResponse<ServiceProduct>>(
      API_ENDPOINTS.SERVICE.DETAIL(id)
    )
    return response.data
  },

  updateService: async (id: string, data: UpdateServiceProductRequest): Promise<ApiResponse<ServiceProduct>> => {
    const response = await apiClient.put<ApiResponse<ServiceProduct>>(
      API_ENDPOINTS.SERVICE.UPDATE(id),
      data
    )
    return response.data
  },

  deleteService: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.SERVICE.DELETE(id)
    )
    return response.data
  },

  updateServiceStatus: async (id: string, isActive: boolean): Promise<ApiResponse<ServiceProduct>> => {
    const response = await apiClient.patch<ApiResponse<ServiceProduct>>(
      API_ENDPOINTS.SERVICE.UPDATE_STATUS(id),
      { isActive }
    )
    return response.data
  },

  getServicesByProduct: async (productId: string): Promise<ApiResponse<ServiceProduct[]>> => {
    const response = await apiClient.get<ApiResponse<ServiceProduct[]>>(
      API_ENDPOINTS.SERVICE.BY_PRODUCT(productId)
    )
    return response.data
  }
}

export default serviceProductApi
