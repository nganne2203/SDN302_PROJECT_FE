import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  ProductFilter,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductStatusRequest,
  ProductWithStock
} from '@/types/api'

export const productApi = {
  // Get all products with filtering
  getProducts: async (filter?: ProductFilter): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCT.LIST,
      { params: filter }
    )
    return response.data
  },

  // Create new product (Admin only)
  createProduct: async (data: CreateProductRequest): Promise<ApiResponse<Product>> => {
    const response = await apiClient.post<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCT.CREATE,
      data
    )
    return response.data
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCT.DETAIL(id)
    )
    return response.data
  },

  // Update product (Admin only)
  updateProduct: async (id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> => {
    const response = await apiClient.put<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCT.UPDATE(id),
      data
    )
    return response.data
  },

  // Delete product (Admin only)
  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.PRODUCT.DELETE(id)
    )
    return response.data
  },

  // Update product status (Admin only)
  updateProductStatus: async (id: string, data: UpdateProductStatusRequest): Promise<ApiResponse<Product>> => {
    const response = await apiClient.patch<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCT.UPDATE_STATUS(id),
      data
    )
    return response.data
  },

  // Search products
  searchProducts: async (query: string, filter?: ProductFilter): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCT.SEARCH,
      { params: { q: query, ...filter } }
    )
    return response.data
  },

  // Get products with stock information
  getProductsWithStock: async (filter?: ProductFilter): Promise<PaginatedResponse<ProductWithStock>> => {
    const response = await apiClient.get<PaginatedResponse<ProductWithStock>>(
      API_ENDPOINTS.PRODUCT.WITH_STOCK,
      { params: filter }
    )
    return response.data
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8): Promise<ApiResponse<Product[]>> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      API_ENDPOINTS.PRODUCT.FEATURED,
      { params: { limit } }
    )
    return response.data
  },

  // Get new arrival products
  getNewArrivals: async (limit = 8): Promise<ApiResponse<Product[]>> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      API_ENDPOINTS.PRODUCT.NEW_ARRIVALS,
      { params: { limit } }
    )
    return response.data
  },

  // Get product by slug
  getProductBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCT.BY_SLUG(slug)
    )
    return response.data
  },

  // Get products by device compatibility
  getProductsByDevice: async (deviceId: string, filter?: ProductFilter): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCT.BY_DEVICE(deviceId),
      { params: filter }
    )
    return response.data
  },

  // Get product detail for ordering
  getProductForOrder: async (id: string): Promise<ApiResponse<ProductWithStock>> => {
    const response = await apiClient.get<ApiResponse<ProductWithStock>>(
      API_ENDPOINTS.PRODUCT.FOR_ORDER(id)
    )
    return response.data
  },

  // Get related products
  getRelatedProducts: async (id: string, limit = 4): Promise<ApiResponse<Product[]>> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      API_ENDPOINTS.PRODUCT.RELATED(id),
      { params: { limit } }
    )
    return response.data
  },

  // Get categories
  getCategories: async (): Promise<ApiResponse<{ _id: string; name: string; slug: string }[]>> => {
    const response = await apiClient.get<ApiResponse<{ _id: string; name: string; slug: string }[]>>(
      API_ENDPOINTS.PRODUCT.CATEGORIES
    )
    return response.data
  }
}

export default productApi
