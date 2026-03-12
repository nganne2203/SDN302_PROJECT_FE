import type { Order, CreateOrderRequest, PaginationMeta } from '@/types/api'

export interface OrderState {
  orders: Order[]
  selectedOrder: Order | null
  pagination: PaginationMeta | null
  isLoading: boolean
  error: string | null
}

export interface FetchOrdersPayload {
  items: Order[]
  pagination: PaginationMeta
}

export type CreateOrderPayload = CreateOrderRequest

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

export interface UpdateOrderStatusPayload {
  orderId: string
  status: string
}

export interface CancelOrderPayload {
  orderId: string
  reason?: string
}
