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

type ProductFilterAll = Omit<ProductFilter, 'page' | 'limit'>

const PRODUCT_LIST_CACHE_TTL_MS = 1000
const PRODUCT_CATEGORIES_CACHE_TTL_MS = 1000

const productListCache = new Map<string, { data: PaginatedResponse<Product>; at: number }>()
const productListInflight = new Map<string, Promise<PaginatedResponse<Product>>>()
let productCategoriesCache: ApiResponse<{ _id: string; name: string; slug: string }[]> | null = null
let productCategoriesCacheAt = 0
let productCategoriesInflight: Promise<ApiResponse<{ _id: string; name: string; slug: string }[]>> | null = null

const normalizeFilter = (filter?: ProductFilter) => {
  if (!filter) return {}

  const normalizedEntries = Object.entries(filter)
    .filter(([, value]) => value !== undefined && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))

  return Object.fromEntries(normalizedEntries)
}

const getProductListCacheKey = (filter?: ProductFilter) => JSON.stringify(normalizeFilter(filter))

const invalidateProductListCache = () => {
  productListCache.clear()
  productListInflight.clear()
}

const invalidateProductCategoriesCache = () => {
  productCategoriesCache = null
  productCategoriesCacheAt = 0
  productCategoriesInflight = null
}

export const productApi = {
  // Get all products with filtering
  getProducts: async (filter?: ProductFilter): Promise<PaginatedResponse<Product>> => {
    const key = getProductListCacheKey(filter)
    const cached = productListCache.get(key)
    const now = Date.now()

    if (cached && now - cached.at <= PRODUCT_LIST_CACHE_TTL_MS) {
      return cached.data
    }

    const inflight = productListInflight.get(key)
    if (inflight) {
      return inflight
    }

    const request = apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCT.LIST,
      { params: filter }
    ).then((response) => {
      productListCache.set(key, { data: response.data, at: Date.now() })
      return response.data
    }).finally(() => {
      productListInflight.delete(key)
    })

    productListInflight.set(key, request)
    return request
  },

  // Get all products without pagination
  getAllProducts: async (filter?: ProductFilterAll): Promise<ApiResponse<Product[]>> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      API_ENDPOINTS.PRODUCT.ALL,
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
    invalidateProductListCache()
    invalidateProductCategoriesCache()
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
    invalidateProductListCache()
    invalidateProductCategoriesCache()
    return response.data
  },

  // Delete product (Admin only)
  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.PRODUCT.DELETE(id)
    )
    invalidateProductListCache()
    invalidateProductCategoriesCache()
    return response.data
  },

  // Update product status (Admin only)
  updateProductStatus: async (id: string, data: UpdateProductStatusRequest): Promise<ApiResponse<Product>> => {
    const response = await apiClient.patch<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCT.UPDATE_STATUS(id),
      data
    )
    invalidateProductListCache()
    invalidateProductCategoriesCache()
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
    const now = Date.now()
    if (productCategoriesCache && now - productCategoriesCacheAt <= PRODUCT_CATEGORIES_CACHE_TTL_MS) {
      return productCategoriesCache
    }

    if (productCategoriesInflight) {
      return productCategoriesInflight
    }

    productCategoriesInflight = apiClient.get<ApiResponse<{ _id: string; name: string; slug: string }[]>>(
      API_ENDPOINTS.PRODUCT.CATEGORIES
    ).then((response) => {
      productCategoriesCache = response.data
      productCategoriesCacheAt = Date.now()
      return response.data
    }).finally(() => {
      productCategoriesInflight = null
    })

    return productCategoriesInflight
  }
}

export default productApi
