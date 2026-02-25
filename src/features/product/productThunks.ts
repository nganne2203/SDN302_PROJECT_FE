import { createAsyncThunk } from '@reduxjs/toolkit'
import { productApi } from '@/apis/product'
import { extractApiError } from '@/utils/apiError'
import { invalidatePricingCache } from '@/features/pricing/pricingSlices'
import type {
  ProductFilter,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductStatusRequest
} from '@/types/api'
import type { FetchProductsPayload } from './productTypes'
import { isCacheValid, CACHE_DURATION } from '@/utils/cacheHelper'
import type { RootState } from '@/apps/store'

export const fetchProductsThunk = createAsyncThunk<
  FetchProductsPayload,
  { filter?: ProductFilter; forceRefresh?: boolean }
>(
  'product/fetchProducts',
  async ({ filter, forceRefresh = false }, { rejectWithValue, getState }) => {
    // Check cache
    const state = getState() as RootState
    const { cache, products, pagination } = state.product
    if (
      !forceRefresh &&
      products.length > 0 &&
      isCacheValid(cache.products.lastFetched, CACHE_DURATION.MEDIUM)
    ) {
      return { data: products, pagination: pagination! }
    }

    try {
      const response = await productApi.getProducts(filter)
      return {
        data: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải danh sách sản phẩm'))
    }
  }
)

export const fetchProductByIdThunk = createAsyncThunk<
  Product,
  { id: string; forceRefresh?: boolean }
>(
  'product/fetchProductById',
  async ({ id, forceRefresh = false }, { rejectWithValue, getState }) => {
    // Check cache
    const state = getState() as RootState
    const { cache, selectedProduct } = state.product

    if (
      !forceRefresh &&
      selectedProduct?._id === id &&
      isCacheValid(cache.productDetail[id]?.lastFetched, CACHE_DURATION.MEDIUM)
    ) {
      return selectedProduct
    }

    try {
      const response = await productApi.getProductById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải thông tin sản phẩm'))
    }
  }
)

export const createProductThunk = createAsyncThunk<Product, CreateProductRequest>(
  'product/createProduct',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await productApi.createProduct(data)
      dispatch(invalidatePricingCache())
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tạo sản phẩm'))
    }
  }
)

export const updateProductThunk = createAsyncThunk<Product, { id: string; data: UpdateProductRequest }>(
  'product/updateProduct',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await productApi.updateProduct(id, data)
      dispatch(invalidatePricingCache())
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể cập nhật sản phẩm'))
    }
  }
)

export const deleteProductThunk = createAsyncThunk<string, string>(
  'product/deleteProduct',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await productApi.deleteProduct(id)
      dispatch(invalidatePricingCache())
      return id
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể xóa sản phẩm'))
    }
  }
)

export const updateProductStatusThunk = createAsyncThunk<
  Product,
  { id: string; data: UpdateProductStatusRequest }
>(
  'product/updateProductStatus',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await productApi.updateProductStatus(id, data)
      dispatch(invalidatePricingCache())
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể cập nhật trạng thái sản phẩm'))
    }
  }
)

export const fetchCategoriesThunk = createAsyncThunk<
  { _id: string; name: string; slug: string }[],
  { forceRefresh?: boolean } | void
>(
  'product/fetchCategories',
  async (options, { rejectWithValue, getState }) => {
    const forceRefresh = options && typeof options === 'object' ? options.forceRefresh : false

    // Check cache
    const state = getState() as RootState
    const { cache, categories } = state.product

    if (
      !forceRefresh &&
      categories.length > 0 &&
      isCacheValid(cache.categories.lastFetched, CACHE_DURATION.LONG)
    ) {
      return categories
    }

    try {
      const response = await productApi.getCategories()
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải danh mục'))
    }
  }
)

export const fetchFeaturedProductsThunk = createAsyncThunk<
  Product[],
  { limit?: number; forceRefresh?: boolean } | number | undefined
>(
  'product/fetchFeaturedProducts',
  async (options, { rejectWithValue, getState }) => {
    const limit = typeof options === 'number' ? options : options?.limit
    const forceRefresh = typeof options === 'object' && options?.forceRefresh

    // Check cache
    const state = getState() as RootState
    const { cache, featuredProducts } = state.product

    if (
      !forceRefresh &&
      featuredProducts.length > 0 &&
      isCacheValid(cache.featuredProducts.lastFetched, CACHE_DURATION.MEDIUM)
    ) {
      return featuredProducts
    }

    try {
      const response = await productApi.getFeaturedProducts(limit)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải sản phẩm nổi bật'))
    }
  }
)

export const fetchNewArrivalsThunk = createAsyncThunk<
  Product[],
  { limit?: number; forceRefresh?: boolean } | number | undefined
>(
  'product/fetchNewArrivals',
  async (options, { rejectWithValue, getState }) => {
    const limit = typeof options === 'number' ? options : options?.limit
    const forceRefresh = typeof options === 'object' && options?.forceRefresh

    // Check cache
    const state = getState() as RootState
    const { cache, newArrivals } = state.product

    if (
      !forceRefresh &&
      newArrivals.length > 0 &&
      isCacheValid(cache.newArrivals.lastFetched, CACHE_DURATION.MEDIUM)
    ) {
      return newArrivals
    }

    try {
      const response = await productApi.getNewArrivals(limit)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải sản phẩm mới'))
    }
  }
)

export const fetchRelatedProductsThunk = createAsyncThunk<Product[], { id: string; limit?: number }>(
  'product/fetchRelatedProducts',
  async ({ id, limit }, { rejectWithValue }) => {
    try {
      const response = await productApi.getRelatedProducts(id, limit)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải sản phẩm liên quan'))
    }
  }
)

export const searchProductsThunk = createAsyncThunk<
  FetchProductsPayload,
  { query: string; filter?: ProductFilter }
>(
  'product/searchProducts',
  async ({ query, filter }, { rejectWithValue }) => {
    try {
      const response = await productApi.searchProducts(query, filter)
      return {
        data: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tìm kiếm sản phẩm'))
    }
  }
)
