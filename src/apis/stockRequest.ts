import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, PaginatedResponse, StockRequestRecord, StockRequestStatus } from '@/types/api'

const STOCK_REQUEST_APPROVE_TIMEOUT_MS = 90_000

export interface StockRequestQuery {
  search?: string
  page?: number
  limit?: number
  status?: StockRequestStatus
  sortBy?: 'createdAt' | 'quantity' | 'status'
  sortOrder?: 'asc' | 'desc'
  branchId?: string
  productId?: string
}

export interface CreateStockRequestPayload {
  branch: string
  product: string
  quantity: number
  reason?: string
}

export interface ApproveStockRequestPayload {
  approvedQuantity: number
  note?: string
}

export const stockRequestApi = {
  createStockRequest: async (data: CreateStockRequestPayload): Promise<ApiResponse<StockRequestRecord>> => {
    const response = await apiClient.post<ApiResponse<StockRequestRecord>>(
      API_ENDPOINTS.STOCK_REQUEST.CREATE,
      data
    )
    return response.data
  },

  getAll: async (query?: StockRequestQuery): Promise<PaginatedResponse<StockRequestRecord>> => {
    const response = await apiClient.get<PaginatedResponse<StockRequestRecord>>(
      API_ENDPOINTS.STOCK_REQUEST.LIST,
      { params: query }
    )
    return response.data
  },

  getPending: async (query?: StockRequestQuery): Promise<PaginatedResponse<StockRequestRecord>> => {
    const response = await apiClient.get<PaginatedResponse<StockRequestRecord>>(
      API_ENDPOINTS.STOCK_REQUEST.PENDING,
      { params: query }
    )
    return response.data
  },

  getByBranch: async (branchId: string, query?: StockRequestQuery): Promise<PaginatedResponse<StockRequestRecord>> => {
    const response = await apiClient.get<PaginatedResponse<StockRequestRecord>>(
      API_ENDPOINTS.STOCK_REQUEST.BY_BRANCH(branchId),
      { params: query }
    )
    return response.data
  },

  getDetail: async (requestId: string): Promise<ApiResponse<StockRequestRecord>> => {
    const response = await apiClient.get<ApiResponse<StockRequestRecord>>(
      API_ENDPOINTS.STOCK_REQUEST.DETAIL(requestId)
    )
    return response.data
  },

  approve: async (
    requestId: string,
    data: ApproveStockRequestPayload
  ): Promise<ApiResponse<StockRequestRecord>> => {
    const response = await apiClient.put<ApiResponse<StockRequestRecord>>(
      API_ENDPOINTS.STOCK_REQUEST.APPROVE(requestId),
      data,
      { timeout: STOCK_REQUEST_APPROVE_TIMEOUT_MS }
    )
    return response.data
  },

  reject: async (requestId: string, note: string): Promise<ApiResponse<StockRequestRecord>> => {
    const response = await apiClient.patch<ApiResponse<StockRequestRecord>>(
      API_ENDPOINTS.STOCK_REQUEST.REJECT(requestId),
      { note }
    )
    return response.data
  }
}

export default stockRequestApi
