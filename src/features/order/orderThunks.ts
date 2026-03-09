import { createAsyncThunk } from '@reduxjs/toolkit'
import { orderApi, type OrderFilter } from '@/apis/order'
import { extractApiError } from '@/utils/apiError'
import type { Order, CreateOrderRequest } from '@/types/api'
import type { FetchOrdersPayload, UpdateOrderStatusPayload, CancelOrderPayload } from './orderTypes'

const getOrderListRequestKey = (params?: OrderFilter) => JSON.stringify(params ?? {})
const inFlightOrderListRequests = new Set<string>()

export const fetchOrdersThunk = createAsyncThunk<FetchOrdersPayload, OrderFilter | undefined>(
  'order/fetchOrders',
  async (params, { rejectWithValue }) => {
    const requestKey = getOrderListRequestKey(params)
    try {
      inFlightOrderListRequests.add(requestKey)
      const response = await orderApi.getMyOrders(params)
      return {
        items: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải danh sách đơn hàng'))
    } finally {
      inFlightOrderListRequests.delete(requestKey)
    }
  },
  {
    condition: (params) => !inFlightOrderListRequests.has(getOrderListRequestKey(params))
  }
)

export const fetchAllOrdersThunk = createAsyncThunk<FetchOrdersPayload, OrderFilter | undefined>(
  'order/fetchAllOrders',
  async (params, { rejectWithValue }) => {
    const requestKey = getOrderListRequestKey(params)
    try {
      inFlightOrderListRequests.add(requestKey)
      const response = await orderApi.getAllOrders(params)
      return {
        items: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải danh sách đơn hàng'))
    } finally {
      inFlightOrderListRequests.delete(requestKey)
    }
  },
  {
    condition: (params) => !inFlightOrderListRequests.has(getOrderListRequestKey(params))
  }
)

export const fetchOrderByIdThunk = createAsyncThunk<Order, string>(
  'order/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrderById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải thông tin đơn hàng'))
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
      return rejectWithValue(extractApiError(error, 'Không thể tạo đơn hàng'))
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
      return rejectWithValue(extractApiError(error, 'Không thể cập nhật trạng thái đơn hàng'))
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
      return rejectWithValue(extractApiError(error, 'Không thể hủy đơn hàng'))
    }
  }
)
