import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type {
  ApiResponse,
  PaginatedResponse,
  Order,
  CreateOrderRequest
} from '@/types/api'

export interface CreateCodOrderRequest {
  shippingAddress: {
    fullname: string
    phone: string
    addressLine: string
    city: string
    ward: string
    provinceCode?: string
    wardCode?: string
  }
  paymentMethod: 'cod'
  message?: string
}

export interface CreateOfflineOrderRequest {
  customerId?: string
  branchId: string
  items: { productId: string; quantity: number; services?: { serviceId: string }[] }[]
  paymentMethod?: string
  note?: string
}

export interface OrderFilter {
  page?: number
  limit?: number
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
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

  // Create online COD order (Customer - ship to address, pay on delivery)
  createCodOrder: async (data: CreateCodOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      API_ENDPOINTS.ORDER.CREATE,
      data
    )
    return response.data
  },

  // Create offline order (Staff/Manager - walk-in customer)
  createOfflineOrder: async (data: CreateOfflineOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      API_ENDPOINTS.ORDER.OFFLINE,
      data
    )
    return response.data
  },

  // Update order status (Admin/Staff)
  updateOrderStatus: async (id: string, status: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      API_ENDPOINTS.ORDER.UPDATE_STATUS(id),
      { status }
    )
    return response.data
  },

  // Cancel order
  cancelOrder: async (id: string, cancelReason?: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      API_ENDPOINTS.ORDER.CANCEL(id),
      { cancelReason }
    )
    return response.data
  },

  // Update delivery info
  updateDeliveryInfo: async (id: string, data: {
    providerName?: string
    trackingCode?: string
    status?: string
    estimatedDeliveryDate?: string
    deliveredAt?: string
    recipientName?: string
  }): Promise<ApiResponse<Order>> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      API_ENDPOINTS.ORDER.UPDATE_DELIVERY(id),
      data
    )
    return response.data
  },

  // Update shipping fee
  updateShippingFee: async (id: string, shippingFee: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      API_ENDPOINTS.ORDER.SHIPPING_FEE(id),
      { shippingFee }
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
