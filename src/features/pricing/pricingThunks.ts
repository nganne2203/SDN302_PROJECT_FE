import { createAsyncThunk } from '@reduxjs/toolkit'
import pricingApi from '@/apis/pricing'
import { extractApiError } from '@/utils/apiError'
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
      return rejectWithValue(extractApiError(error, 'Khong the tai danh sach bang gia'))
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
      return rejectWithValue(extractApiError(error, 'Khong the tai thong tin bang gia'))
    }
  }
)

export const createPricingThunk = createAsyncThunk<PricingRule, CreatePricingPayload>(
  'pricing/createPricing',
  async (data, { rejectWithValue }) => {
    try {
      const response = await pricingApi.createPricing(data)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Khong the tao bang gia'))
    }
  }
)

export const updatePricingThunk = createAsyncThunk<
  PricingRule,
  { id: string; data: UpdatePricingPayload }
>(
  'pricing/updatePricing',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await pricingApi.updatePricing(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Khong the cap nhat bang gia'))
    }
  }
)

export const deletePricingThunk = createAsyncThunk<string, string>(
  'pricing/deletePricing',
  async (id, { rejectWithValue }) => {
    try {
      await pricingApi.deletePricing(id)
      return id
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Khong the xoa bang gia'))
    }
  }
)

export const togglePricingStatusThunk = createAsyncThunk<PricingRule, string>(
  'pricing/togglePricingStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await pricingApi.togglePricingStatus(id)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Khong the cap nhat trang thai bang gia'))
    }
  }
)

export const bulkCreatePricingThunk = createAsyncThunk<PricingRule[], BulkPricingPayload>(
  'pricing/bulkCreatePricing',
  async (data, { rejectWithValue }) => {
    try {
      const response = await pricingApi.bulkCreatePricing(data)
      return response.data || []
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Khong the tao bang gia hang loat'))
    }
  }
)
