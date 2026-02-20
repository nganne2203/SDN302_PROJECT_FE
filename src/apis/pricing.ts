import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type {
  PricingRule,
  PricingFilter,
  CreatePricingPayload,
  UpdatePricingPayload,
  BulkPricingPayload,
  PricingCalculation,
  PricingProduct
} from '@/features/pricing/pricingTypes'

export const pricingApi = {
  getPricings: async (filter?: PricingFilter): Promise<PaginatedResponse<PricingRule>> => {
    const response = await apiClient.get<PaginatedResponse<PricingRule>>(
      API_ENDPOINTS.PRICING.LIST,
      { params: filter }
    )
    return response.data
  },

  getPricingById: async (id: string): Promise<ApiResponse<PricingRule>> => {
    const response = await apiClient.get<ApiResponse<PricingRule>>(
      API_ENDPOINTS.PRICING.DETAIL(id)
    )
    return response.data
  },

  createPricing: async (data: CreatePricingPayload): Promise<ApiResponse<PricingRule>> => {
    const response = await apiClient.post<ApiResponse<PricingRule>>(
      API_ENDPOINTS.PRICING.CREATE,
      data
    )
    return response.data
  },

  updatePricing: async (id: string, data: UpdatePricingPayload): Promise<ApiResponse<PricingRule>> => {
    const response = await apiClient.put<ApiResponse<PricingRule>>(
      API_ENDPOINTS.PRICING.UPDATE(id),
      data
    )
    return response.data
  },

  deletePricing: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.PRICING.DELETE(id)
    )
    return response.data
  },

  togglePricingStatus: async (id: string): Promise<ApiResponse<PricingRule>> => {
    const response = await apiClient.patch<ApiResponse<PricingRule>>(
      API_ENDPOINTS.PRICING.TOGGLE(id)
    )
    return response.data
  },

  getPricingByProduct: async (productId: string): Promise<ApiResponse<{ product: PricingProduct; pricingTiers: PricingRule[] }>> => {
    const response = await apiClient.get<ApiResponse<{ product: PricingProduct; pricingTiers: PricingRule[] }>>(
      API_ENDPOINTS.PRICING.BY_PRODUCT(productId)
    )
    return response.data
  },

  deletePricingByProduct: async (productId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.PRICING.DELETE_BY_PRODUCT(productId)
    )
    return response.data
  },

  bulkCreatePricing: async (data: BulkPricingPayload): Promise<ApiResponse<PricingRule[]>> => {
    const response = await apiClient.post<ApiResponse<PricingRule[]>>(
      API_ENDPOINTS.PRICING.BULK_CREATE,
      data
    )
    return response.data
  },

  calculatePrice: async (productId: string, quantity: number): Promise<ApiResponse<PricingCalculation>> => {
    const response = await apiClient.get<ApiResponse<PricingCalculation>>(
      API_ENDPOINTS.PRICING.CALCULATE(productId),
      { params: { quantity } }
    )
    return response.data
  }
}

export default pricingApi
