import { createAsyncThunk } from '@reduxjs/toolkit'
import { productApi } from '@/apis/product'
import type {
  ProductFilter,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductStatusRequest
} from '@/types/api'
import type { FetchProductsPayload } from './productTypes'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

export const fetchProductsThunk = createAsyncThunk<FetchProductsPayload, ProductFilter | undefined>(
  'product/fetchProducts',
  async (filter, { rejectWithValue }) => {
    try {
      const response = await productApi.getProducts(filter)
      return {
        data: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tải danh sách sản phẩm'
      )
    }
  }
)

export const fetchProductByIdThunk = createAsyncThunk<Product, string>(
  'product/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productApi.getProductById(id)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tải thông tin sản phẩm'
      )
    }
  }
)

export const createProductThunk = createAsyncThunk<Product, CreateProductRequest>(
  'product/createProduct',
  async (data, { rejectWithValue }) => {
    try {
      const response = await productApi.createProduct(data)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tạo sản phẩm'
      )
    }
  }
)

export const updateProductThunk = createAsyncThunk<Product, { id: string; data: UpdateProductRequest }>(
  'product/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await productApi.updateProduct(id, data)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể cập nhật sản phẩm'
      )
    }
  }
)

export const deleteProductThunk = createAsyncThunk<string, string>(
  'product/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await productApi.deleteProduct(id)
      return id
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể xóa sản phẩm'
      )
    }
  }
)

export const updateProductStatusThunk = createAsyncThunk<
  Product,
  { id: string; data: UpdateProductStatusRequest }
>(
  'product/updateProductStatus',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await productApi.updateProductStatus(id, data)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể cập nhật trạng thái sản phẩm'
      )
    }
  }
)

export const fetchCategoriesThunk = createAsyncThunk<
  { _id: string; name: string; slug: string }[],
  void
>(
  'product/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productApi.getCategories()
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tải danh mục'
      )
    }
  }
)

export const fetchFeaturedProductsThunk = createAsyncThunk<Product[], number | undefined>(
  'product/fetchFeaturedProducts',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await productApi.getFeaturedProducts(limit)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tải sản phẩm nổi bật'
      )
    }
  }
)

export const fetchNewArrivalsThunk = createAsyncThunk<Product[], number | undefined>(
  'product/fetchNewArrivals',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await productApi.getNewArrivals(limit)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tải sản phẩm mới'
      )
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
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tải sản phẩm liên quan'
      )
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
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tìm kiếm sản phẩm'
      )
    }
  }
)
