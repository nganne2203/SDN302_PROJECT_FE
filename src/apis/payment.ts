import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface PaymentRecord {
  _id: string
  orderId: string
  orderNumber: string
  userId: string
  amount: number
  method: string
  status: 'pending' | 'success' | 'failed' | 'refunded' | 'canceled' | 'cancelled'
  transactionId?: string
  providerData?: Record<string, unknown>
  paidAt?: string
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export interface BankInfo {
  code: string
  name: string
  logo?: string
}

export interface VnpayCreateRequest {
  shippingAddress: {
    fullname: string
    phone: string
    addressLine: string
    city: string
    ward: string
    provinceCode?: string
    wardCode?: string
  }
  message?: string
  bankCode?: string
  locale?: 'vn' | 'en'
}

export interface PaymentFilter {
  page?: number
  limit?: number
  status?: string
  method?: string
  startDate?: string
  endDate?: string
}

export const paymentApi = {
  getBanks: async (): Promise<ApiResponse<BankInfo[]>> => {
    const response = await apiClient.get<ApiResponse<BankInfo[]>>(
      API_ENDPOINTS.PAYMENT.BANKS
    )
    return response.data
  },

  getVnpayReturn: async (params: Record<string, string>): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get<ApiResponse<unknown>>(
      API_ENDPOINTS.PAYMENT.VNPAY_RETURN,
      { params }
    )
    return response.data
  },

  createVnpayPayment: async (data: VnpayCreateRequest): Promise<ApiResponse<{
    paymentUrl: string
    orderId: string
    orderNumber: string
    transactionId: string
    amount: number
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      paymentUrl: string
      orderId: string
      orderNumber: string
      transactionId: string
      amount: number
    }>>(
      API_ENDPOINTS.PAYMENT.VNPAY_CREATE,
      data
    )
    return response.data
  },

  getMyPayments: async (filter?: PaymentFilter): Promise<PaginatedResponse<PaymentRecord>> => {
    const response = await apiClient.get<PaginatedResponse<PaymentRecord>>(
      API_ENDPOINTS.PAYMENT.MY_PAYMENTS,
      { params: filter }
    )
    return response.data
  },

  queryTransactionStatus: async (orderNumber: string): Promise<ApiResponse<PaymentRecord>> => {
    const response = await apiClient.get<ApiResponse<PaymentRecord>>(
      API_ENDPOINTS.PAYMENT.STATUS(orderNumber)
    )
    return response.data
  },

  checkPaymentResult: async (orderNumber: string): Promise<ApiResponse<PaymentRecord>> => {
    const response = await apiClient.get<ApiResponse<PaymentRecord>>(
      API_ENDPOINTS.PAYMENT.CHECK(orderNumber)
    )
    return response.data
  },

  getPaymentByOrder: async (orderId: string): Promise<ApiResponse<PaymentRecord>> => {
    const response = await apiClient.get<ApiResponse<PaymentRecord>>(
      API_ENDPOINTS.PAYMENT.BY_ORDER(orderId)
    )
    return response.data
  },

  cancelPayment: async (orderId: string): Promise<ApiResponse<PaymentRecord>> => {
    const response = await apiClient.post<ApiResponse<PaymentRecord>>(
      API_ENDPOINTS.PAYMENT.CANCEL(orderId)
    )
    return response.data
  }
}

export default paymentApi
