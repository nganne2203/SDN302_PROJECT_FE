import { createAsyncThunk } from '@reduxjs/toolkit'
import { orderApi, type OrderFilter } from '@/apis/order'
import type { Order, CreateOrderRequest } from '@/types/api'
import type { FetchOrdersPayload, UpdateOrderStatusPayload, CancelOrderPayload } from './orderTypes'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

export const fetchOrdersThunk = createAsyncThunk<FetchOrdersPayload, OrderFilter | undefined>(
  'order/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderApi.getMyOrders(params)
      return {
        items: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        return rejectWithValue(errorData.errors.join(', '))
      }
      return rejectWithValue(
        errorData?.message || 'Không thể tải danh sách đơn hàng'
      )
    }
  }
)

export const fetchAllOrdersThunk = createAsyncThunk<FetchOrdersPayload, OrderFilter | undefined>(
  'order/fetchAllOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderApi.getAllOrders(params)
      return {
        items: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        return rejectWithValue(errorData.errors.join(', '))
      }
      return rejectWithValue(
        errorData?.message || 'Không thể tải danh sách đơn hàng'
      )
    }
  }
)

export const fetchOrderByIdThunk = createAsyncThunk<Order, string>(
  'order/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrderById(id)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        return rejectWithValue(errorData.errors.join(', '))
      }
      return rejectWithValue(
        errorData?.message || 'Không thể tải thông tin đơn hàng'
      )
    }
  }
)

export const createOrderThunk = createAsyncThunk<Order, CreateOrderRequest>(
  'order/createOrder',
  async (data, { rejectWithValue }) => {
    try {
      const response = await orderApi.createOrder(data)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        return rejectWithValue(errorData.errors.join(', '))
      }
      return rejectWithValue(
        errorData?.message || 'Không thể tạo đơn hàng'
      )
    }
  }
)

export const updateOrderStatusThunk = createAsyncThunk<Order, UpdateOrderStatusPayload>(
  'order/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await orderApi.updateOrderStatus(orderId, status)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        return rejectWithValue(errorData.errors.join(', '))
      }
      return rejectWithValue(
        errorData?.message || 'Không thể cập nhật trạng thái đơn hàng'
      )
    }
  }
)

export const cancelOrderThunk = createAsyncThunk<Order, CancelOrderPayload>(
  'order/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await orderApi.cancelOrder(orderId, reason)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        return rejectWithValue(errorData.errors.join(', '))
      }
      return rejectWithValue(
        errorData?.message || 'Không thể hủy đơn hàng'
      )
    }
  }
)
