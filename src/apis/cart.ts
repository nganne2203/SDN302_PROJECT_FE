import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, Cart, CartItem } from '@/types/api'

interface CartServicePayload {
  serviceId: string
}

interface CartChangedEventDetail {
  type: 'add' | 'sync'
  delta?: number
}

const CART_CACHE_TTL_MS = 1000

let cartCache: ApiResponse<Cart> | null = null
let cartCacheAt = 0
let cartRequestPromise: Promise<ApiResponse<Cart>> | null = null

const invalidateCartCache = () => {
  cartCache = null
  cartCacheAt = 0
  cartRequestPromise = null
}

const emitCartChanged = (detail: CartChangedEventDetail = { type: 'sync' }) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<CartChangedEventDetail>('cart:changed', { detail }))
  }
}

export const cartApi = {
  getCart: async (): Promise<ApiResponse<Cart>> => {
    const now = Date.now()

    if (cartCache && now - cartCacheAt <= CART_CACHE_TTL_MS) {
      return cartCache
    }

    if (cartRequestPromise) {
      return cartRequestPromise
    }

    cartRequestPromise = apiClient.get<ApiResponse<Cart>>(API_ENDPOINTS.CART.LIST)
      .then((response) => {
        cartCache = response.data
        cartCacheAt = Date.now()
        return response.data
      })
      .finally(() => {
        cartRequestPromise = null
      })

    return cartRequestPromise
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
    invalidateCartCache()
    emitCartChanged({ type: 'sync' })
    return response.data
  },

  updateCartItemQuantity: async (productId: string, quantity: number): Promise<ApiResponse<CartItem>> => {
    const response = await apiClient.put<ApiResponse<CartItem>>(
      API_ENDPOINTS.CART.UPDATE_QUANTITY,
      { productId, quantity }
    )
    invalidateCartCache()
    emitCartChanged({ type: 'sync' })
    return response.data
  },

  updateCartItemServices: async (productId: string, services: CartServicePayload[]): Promise<ApiResponse<CartItem>> => {
    const response = await apiClient.put<ApiResponse<CartItem>>(
      API_ENDPOINTS.CART.UPDATE_SERVICES,
      { productId, services }
    )
    invalidateCartCache()
    emitCartChanged({ type: 'sync' })
    return response.data
  },

  removeFromCart: async (productId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.CART.REMOVE_ITEM,
      { data: { productId } }
    )
    invalidateCartCache()
    emitCartChanged({ type: 'sync' })
    return response.data
  },

  clearCart: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.CART.CLEAR)
    invalidateCartCache()
    emitCartChanged({ type: 'sync' })
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
