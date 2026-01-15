import { createAsyncThunk } from '@reduxjs/toolkit'
import { productApi } from '@/apis/product'
import type { ProductFilter, Product } from '@/types/api'
import type { FetchProductsPayload } from './productTypes'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

export const fetchProductsThunk = createAsyncThunk<FetchProductsPayload, ProductFilter | undefined>(
  'product/fetchProducts',
  async (filter, { rejectWithValue }) => {
    try {
      const response = await productApi.getProducts(filter)
      return response.data
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

export const fetchCategoriesThunk = createAsyncThunk<{ id: string; name: string }[], void>(
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
