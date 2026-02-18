import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, Cart, CartItem } from '@/types/api'

interface CartServicePayload {
  serviceId: string
}

export const cartApi = {
  getCart: async (): Promise<ApiResponse<Cart>> => {
    const response = await apiClient.get<ApiResponse<Cart>>(API_ENDPOINTS.CART.LIST)
    return response.data
  },

  addToCart: async (
    productId: string,
    quantity: number,
    services?: CartServicePayload[]
  ): Promise<ApiResponse<CartItem>> => {
    const response = await apiClient.post<ApiResponse<CartItem>>(
      API_ENDPOINTS.CART.ADD,
      { productId, quantity, services }
    )
    return response.data
  },

  updateCartItemQuantity: async (productId: string, quantity: number): Promise<ApiResponse<CartItem>> => {
    const response = await apiClient.put<ApiResponse<CartItem>>(
      API_ENDPOINTS.CART.UPDATE_QUANTITY,
      { productId, quantity }
    )
    return response.data
  },

  updateCartItemServices: async (productId: string, services: CartServicePayload[]): Promise<ApiResponse<CartItem>> => {
    const response = await apiClient.put<ApiResponse<CartItem>>(
      API_ENDPOINTS.CART.UPDATE_SERVICES,
      { productId, services }
    )
    return response.data
  },

  removeFromCart: async (productId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.CART.REMOVE_ITEM,
      { data: { productId } }
    )
    return response.data
  },

  clearCart: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.CART.CLEAR)
    return response.data
  },

  validateBeforeCheckout: async (): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post<ApiResponse<unknown>>(
      API_ENDPOINTS.CART.VALIDATE
    )
    return response.data
  }
}

export default cartApi
