import { createAsyncThunk } from '@reduxjs/toolkit'
import pricingApi from '@/apis/pricing'
import { extractApiError } from '@/utils/apiError'
import { invalidateProductCache } from '@/features/product/productSlices'
import type {
  PricingRule,
  PricingFilter,
  CreatePricingPayload,
  UpdatePricingPayload,
  BulkPricingPayload,
  FetchPricingsPayload
} from './pricingTypes'

export const fetchPricingsThunk = createAsyncThunk<FetchPricingsPayload, PricingFilter | undefined>(
  'pricing/fetchPricings',
  async (filter, { rejectWithValue }) => {
    try {
      const response = await pricingApi.getPricings(filter)
      return {
        items: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải danh sách bảng giá'))
    }
  }
)

export const fetchPricingByIdThunk = createAsyncThunk<PricingRule, string>(
  'pricing/fetchPricingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await pricingApi.getPricingById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải thông tin bảng giá'))
    }
  }
)

export const createPricingThunk = createAsyncThunk<PricingRule, CreatePricingPayload>(
  'pricing/createPricing',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await pricingApi.createPricing(data)
      dispatch(invalidateProductCache())
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tạo bảng giá'))
    }
  }
)

export const updatePricingThunk = createAsyncThunk<
  PricingRule,
  { id: string; data: UpdatePricingPayload }
>(
  'pricing/updatePricing',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await pricingApi.updatePricing(id, data)
      dispatch(invalidateProductCache())
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể cập nhật bảng giá'))
    }
  }
)

export const deletePricingThunk = createAsyncThunk<string, string>(
  'pricing/deletePricing',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await pricingApi.deletePricing(id)
      dispatch(invalidateProductCache())
      return id
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể xóa bảng giá'))
    }
  }
)

export const togglePricingStatusThunk = createAsyncThunk<PricingRule, string>(
  'pricing/togglePricingStatus',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await pricingApi.togglePricingStatus(id)
      dispatch(invalidateProductCache())
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể cập nhật trạng thái bảng giá'))
    }
  }
)

export const bulkCreatePricingThunk = createAsyncThunk<PricingRule[], BulkPricingPayload>(
  'pricing/bulkCreatePricing',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await pricingApi.bulkCreatePricing(data)
      dispatch(invalidateProductCache())
      return response.data || []
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tạo bảng giá hàng loạt'))
    }
  }
)
