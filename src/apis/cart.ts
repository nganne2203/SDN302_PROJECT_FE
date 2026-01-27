import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, Cart, CartItem } from '@/types/api'

export const cartApi = {
  getCart: async (): Promise<ApiResponse<Cart>> => {
    const response = await apiClient.get<ApiResponse<Cart>>(API_ENDPOINTS.CART.GET)
    return response.data
  },

  addToCart: async (productId: string, quantity: number): Promise<ApiResponse<CartItem>> => {
    const response = await apiClient.post<ApiResponse<CartItem>>(
      API_ENDPOINTS.CART.ADD,
      { productId, quantity }
    )
    return response.data
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<ApiResponse<CartItem>> => {
    const response = await apiClient.put<ApiResponse<CartItem>>(
      API_ENDPOINTS.CART.UPDATE,
      { itemId, quantity }
    )
    return response.data
  },

  removeFromCart: async (itemId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.CART.REMOVE(itemId)
    )
    return response.data
  },

  clearCart: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.CART.CLEAR)
    return response.data
  }
}

export default cartApi
