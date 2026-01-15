import { createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { Order, CreateOrderRequest, ApiResponse, PaginatedResponse } from '@/types/api'
import type { FetchOrdersPayload } from './orderTypes'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'
import type { PaginationParams } from '@/types/pagination'

export const fetchOrdersThunk = createAsyncThunk<FetchOrdersPayload, PaginationParams | undefined>(
  'order/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<PaginatedResponse<Order>>(
        API_ENDPOINTS.ORDER.LIST,
        { params }
      )
      return response.data.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tải danh sách đơn hàng'
      )
    }
  }
)

export const fetchOrderByIdThunk = createAsyncThunk<Order, string>(
  'order/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<Order>>(
        API_ENDPOINTS.ORDER.DETAIL(id)
      )
      return response.data.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tải thông tin đơn hàng'
      )
    }
  }
)

export const createOrderThunk = createAsyncThunk<Order, CreateOrderRequest>(
  'order/createOrder',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiResponse<Order>>(
        API_ENDPOINTS.ORDER.CREATE,
        data
      )
      return response.data.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tạo đơn hàng'
      )
    }
  }
)

export const cancelOrderThunk = createAsyncThunk<Order, string>(
  'order/cancelOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<ApiResponse<Order>>(
        API_ENDPOINTS.ORDER.CANCEL(id)
      )
      return response.data.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể hủy đơn hàng'
      )
    }
  }
)
