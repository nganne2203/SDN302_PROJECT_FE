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
