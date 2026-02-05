import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type {
  ApiResponse,
  PaginatedResponse,
  Order,
  CreateOrderRequest
} from '@/types/api'

export interface OrderFilter {
  page?: number
  limit?: number
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'canceled'
  sortBy?: 'createdAt' | 'totalAmount' | 'orderNumber'
  sortOrder?: 'asc' | 'desc'
  search?: string
  startDate?: string
  endDate?: string
}

export const orderApi = {
  // Get all orders (Admin/Staff)
  getAllOrders: async (filter?: OrderFilter): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>(
      API_ENDPOINTS.ORDER.ALL,
      { params: filter }
    )
    return response.data
  },

  // Get my orders (Customer)
  getMyOrders: async (filter?: OrderFilter): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>(
      API_ENDPOINTS.ORDER.MY_ORDERS,
      { params: filter }
    )
    return response.data
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<Order>>(
      API_ENDPOINTS.ORDER.DETAIL(id)
    )
    return response.data
  },

  // Get order by order number
  getOrderByOrderNumber: async (orderNumber: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<Order>>(
      API_ENDPOINTS.ORDER.BY_ORDER_NUMBER(orderNumber)
    )
    return response.data
  },

  // Create order
  createOrder: async (data: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      API_ENDPOINTS.ORDER.CREATE,
      data
    )
    return response.data
  },

  // Update order status (Admin/Staff)
  updateOrderStatus: async (id: string, status: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.put<ApiResponse<Order>>(
      API_ENDPOINTS.ORDER.UPDATE_STATUS(id),
      { status }
    )
    return response.data
  },

  // Cancel order
  cancelOrder: async (id: string, reason?: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.put<ApiResponse<Order>>(
      API_ENDPOINTS.ORDER.CANCEL(id),
      { reason }
    )
    return response.data
  },

  // Update delivery info
  updateDeliveryInfo: async (id: string, data: {
    trackingNumber?: string
    carrier?: string
    estimatedDelivery?: string
  }): Promise<ApiResponse<Order>> => {
    const response = await apiClient.put<ApiResponse<Order>>(
      API_ENDPOINTS.ORDER.UPDATE_DELIVERY(id),
      data
    )
    return response.data
  },

  // Get order statistics
  getOrderStatistics: async (filter?: { startDate?: string; endDate?: string }): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get<ApiResponse<unknown>>(
      API_ENDPOINTS.ORDER.STATISTICS,
      { params: filter }
    )
    return response.data
  }
}
