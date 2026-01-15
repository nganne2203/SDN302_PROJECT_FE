import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Product, 
  ProductFilter 
} from '@/types/api'

export const productApi = {
  getProducts: async (filter?: ProductFilter): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCT.LIST,
      { params: filter }
    )
    return response.data
  },

  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCT.DETAIL(id)
    )
    return response.data
  },

  searchProducts: async (query: string): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCT.SEARCH,
      { params: { q: query } }
    )
    return response.data
  },

  getCategories: async (): Promise<ApiResponse<{ id: string; name: string }[]>> => {
    const response = await apiClient.get<ApiResponse<{ id: string; name: string }[]>>(
      API_ENDPOINTS.PRODUCT.CATEGORIES
    )
    return response.data
  },
}

export default productApi
