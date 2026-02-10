import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, PaginatedResponse, StoreInventoryRecord } from '@/types/api'

export interface StoreInventoryQuery {
  page?: number
  limit?: number
  sortBy?: 'quantity' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateStoreInventoryPayload {
  branch: string
  product: string
  quantity?: number
  minThreshold?: number
  maxThreshold?: number
}

export interface UpdateThresholdPayload {
  minThreshold?: number
  maxThreshold?: number
}

export const storeInventoryApi = {
  createStoreInventory: async (data: CreateStoreInventoryPayload): Promise<ApiResponse<StoreInventoryRecord>> => {
    const response = await apiClient.post<ApiResponse<StoreInventoryRecord>>(
      API_ENDPOINTS.STORE_INVENTORY.CREATE,
      data
    )
    return response.data
  },

  getByBranch: async (branchId: string, query?: StoreInventoryQuery): Promise<PaginatedResponse<StoreInventoryRecord>> => {
    const response = await apiClient.get<PaginatedResponse<StoreInventoryRecord>>(
      API_ENDPOINTS.STORE_INVENTORY.BY_BRANCH(branchId),
      { params: query }
    )
    return response.data
  },

  getOutOfStock: async (branchId: string, query?: StoreInventoryQuery): Promise<PaginatedResponse<StoreInventoryRecord>> => {
    const response = await apiClient.get<PaginatedResponse<StoreInventoryRecord>>(
      API_ENDPOINTS.STORE_INVENTORY.OUT_OF_STOCK(branchId),
      { params: query }
    )
    return response.data
  },

  getLowStock: async (branchId: string, query?: StoreInventoryQuery): Promise<PaginatedResponse<StoreInventoryRecord>> => {
    const response = await apiClient.get<PaginatedResponse<StoreInventoryRecord>>(
      API_ENDPOINTS.STORE_INVENTORY.LOW_STOCK(branchId),
      { params: query }
    )
    return response.data
  },

  getNeedRestock: async (branchId: string, query?: StoreInventoryQuery): Promise<PaginatedResponse<StoreInventoryRecord>> => {
    const response = await apiClient.get<PaginatedResponse<StoreInventoryRecord>>(
      API_ENDPOINTS.STORE_INVENTORY.NEED_RESTOCK(branchId),
      { params: query }
    )
    return response.data
  },

  getOverstock: async (branchId: string, query?: StoreInventoryQuery): Promise<PaginatedResponse<StoreInventoryRecord>> => {
    const response = await apiClient.get<PaginatedResponse<StoreInventoryRecord>>(
      API_ENDPOINTS.STORE_INVENTORY.OVERSTOCK(branchId),
      { params: query }
    )
    return response.data
  },

  getByProduct: async (branchId: string, productId: string): Promise<ApiResponse<StoreInventoryRecord>> => {
    const response = await apiClient.get<ApiResponse<StoreInventoryRecord>>(
      API_ENDPOINTS.STORE_INVENTORY.BY_PRODUCT(branchId, productId)
    )
    return response.data
  },

  updateThresholds: async (
    branchId: string,
    productId: string,
    data: UpdateThresholdPayload
  ): Promise<ApiResponse<StoreInventoryRecord>> => {
    const response = await apiClient.patch<ApiResponse<StoreInventoryRecord>>(
      API_ENDPOINTS.STORE_INVENTORY.UPDATE_THRESHOLDS(branchId, productId),
      data
    )
    return response.data
  },

  deleteStoreInventory: async (inventoryId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.STORE_INVENTORY.DELETE(inventoryId)
    )
    return response.data
  }
}

export default storeInventoryApi
