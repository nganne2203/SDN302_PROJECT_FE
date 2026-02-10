import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, PaginatedResponse, InventoryRecord } from '@/types/api'

export interface InventoryQuery {
  page?: number
  limit?: number
  sortBy?: 'quantity' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  threshold?: number
}

export interface UpdateInventoryPayload {
  quantity?: number
  location?: string
}

export interface CreateInventoryPayload {
  product: string
  quantity?: number
  location?: string
}

export const inventoryApi = {
  getInventories: async (query?: InventoryQuery): Promise<PaginatedResponse<InventoryRecord>> => {
    const response = await apiClient.get<PaginatedResponse<InventoryRecord>>(
      API_ENDPOINTS.INVENTORY.LIST,
      { params: query }
    )
    return response.data
  },

  getLowStock: async (query?: InventoryQuery): Promise<PaginatedResponse<InventoryRecord>> => {
    const response = await apiClient.get<PaginatedResponse<InventoryRecord>>(
      API_ENDPOINTS.INVENTORY.LOW_STOCK,
      { params: query }
    )
    return response.data
  },

  createInventory: async (data: CreateInventoryPayload): Promise<ApiResponse<InventoryRecord>> => {
    const response = await apiClient.post<ApiResponse<InventoryRecord>>(
      API_ENDPOINTS.INVENTORY.CREATE,
      data
    )
    return response.data
  },

  updateInventory: async (inventoryId: string, data: UpdateInventoryPayload): Promise<ApiResponse<InventoryRecord>> => {
    const response = await apiClient.put<ApiResponse<InventoryRecord>>(
      API_ENDPOINTS.INVENTORY.UPDATE(inventoryId),
      data
    )
    return response.data
  },

  getInventoryByProduct: async (productId: string): Promise<ApiResponse<InventoryRecord>> => {
    const response = await apiClient.get<ApiResponse<InventoryRecord>>(
      API_ENDPOINTS.INVENTORY.BY_PRODUCT(productId)
    )
    return response.data
  },

  adjustInventory: async (productId: string, quantity: number): Promise<ApiResponse<InventoryRecord>> => {
    const response = await apiClient.put<ApiResponse<InventoryRecord>>(
      API_ENDPOINTS.INVENTORY.ADJUST(productId),
      { quantity }
    )
    return response.data
  }
}

export default inventoryApi
