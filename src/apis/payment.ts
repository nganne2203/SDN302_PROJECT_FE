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
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  transactionId?: string
  providerData?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface BankInfo {
  bankCode: string
  bankName: string
  logoUrl?: string
}

export interface VnpayCreateRequest {
  orderId: string
  returnUrl?: string
  bankCode?: string
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
  // Get list of supported banks
  getBanks: async (): Promise<ApiResponse<BankInfo[]>> => {
    const response = await apiClient.get<ApiResponse<BankInfo[]>>(
      API_ENDPOINTS.PAYMENT.BANKS
    )
    return response.data
  },

  // Get VNPay return (query params handled by backend redirect)
  getVnpayReturn: async (params: Record<string, string>): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get<ApiResponse<unknown>>(
      API_ENDPOINTS.PAYMENT.VNPAY_RETURN,
      { params }
    )
    return response.data
  },

  // Create VNPay payment URL
  createVnpayPayment: async (data: VnpayCreateRequest): Promise<ApiResponse<{ paymentUrl: string }>> => {
    const response = await apiClient.post<ApiResponse<{ paymentUrl: string }>>(
      API_ENDPOINTS.PAYMENT.VNPAY_CREATE,
      data
    )
    return response.data
  },

  // Get my payment history
  getMyPayments: async (filter?: PaymentFilter): Promise<PaginatedResponse<PaymentRecord>> => {
    const response = await apiClient.get<PaginatedResponse<PaymentRecord>>(
      API_ENDPOINTS.PAYMENT.MY_PAYMENTS,
      { params: filter }
    )
    return response.data
  },

  // Query transaction status by order number
  queryTransactionStatus: async (orderNumber: string): Promise<ApiResponse<PaymentRecord>> => {
    const response = await apiClient.get<ApiResponse<PaymentRecord>>(
      API_ENDPOINTS.PAYMENT.STATUS(orderNumber)
    )
    return response.data
  },

  // Check payment result by order number
  checkPaymentResult: async (orderNumber: string): Promise<ApiResponse<PaymentRecord>> => {
    const response = await apiClient.get<ApiResponse<PaymentRecord>>(
      API_ENDPOINTS.PAYMENT.CHECK(orderNumber)
    )
    return response.data
  },

  // Get payment by order ID
  getPaymentByOrder: async (orderId: string): Promise<ApiResponse<PaymentRecord>> => {
    const response = await apiClient.get<ApiResponse<PaymentRecord>>(
      API_ENDPOINTS.PAYMENT.BY_ORDER(orderId)
    )
    return response.data
  },

  // Cancel payment
  cancelPayment: async (orderId: string): Promise<ApiResponse<PaymentRecord>> => {
    const response = await apiClient.post<ApiResponse<PaymentRecord>>(
      API_ENDPOINTS.PAYMENT.CANCEL(orderId)
    )
    return response.data
  }
}

export default paymentApi
