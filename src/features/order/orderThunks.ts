import { createAsyncThunk } from '@reduxjs/toolkit'
import { orderApi, type OrderFilter } from '@/apis/order'
import paymentApi from '@/apis/payment'
import { extractApiError } from '@/utils/apiError'
import type { Order, CreateOrderRequest } from '@/types/api'
import { isOrderPaid } from '@/utils/orderPayment'
import type { FetchOrdersPayload, UpdateOrderStatusPayload, CancelOrderPayload } from './orderTypes'

const getOrderListRequestKey = (params?: OrderFilter) => JSON.stringify(params ?? {})
const inFlightOrderListRequests = new Set<string>()
const paymentByOrderIdCache = new Map<string, { status?: string; paidAt?: string; failureReason?: string } | null>()

const getOrderId = (order: Order): string =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (order as any)?._id?.toString?.() || order.id || ''

const mapWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> => {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const current = nextIndex
      nextIndex += 1
      if (current >= items.length) return
      results[current] = await mapper(items[current])
    }
  })

  await Promise.all(workers)
  return results
}

const hydrateOrderPayment = async (order: Order): Promise<Order> => {
  if (isOrderPaid(order)) return order

  const paymentMethod = String((order as unknown as { paymentMethod?: string }).paymentMethod || '').toLowerCase()
  if (!paymentMethod || paymentMethod === 'cod') return order

  const orderId = getOrderId(order)
  if (!orderId) return order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderNumber = String((order as any)?.orderNumber || '').trim()

  const cached = paymentByOrderIdCache.get(orderId)
  if (cached !== undefined) {
    return {
      ...(order as unknown as Record<string, unknown>),
      payment: cached,
      paymentStatus: (order as unknown as { paymentStatus?: string }).paymentStatus || cached?.status
    } as unknown as Order
  }

  try {
    const response = await paymentApi.getPaymentByOrder(orderId)
    const payment = response.data
      ? { status: response.data.status, paidAt: response.data.paidAt, failureReason: response.data.failureReason }
      : null
    paymentByOrderIdCache.set(orderId, payment)
    return {
      ...(order as unknown as Record<string, unknown>),
      payment,
      paymentStatus: (order as unknown as { paymentStatus?: string }).paymentStatus || payment?.status
    } as unknown as Order
  } catch {
    // Some backends expose payment lookup by orderNumber instead of orderId.
    if (orderNumber) {
      try {
        const response = await paymentApi.checkPaymentResult(orderNumber)
        const payment = response.data
          ? { status: response.data.status, paidAt: response.data.paidAt, failureReason: response.data.failureReason }
          : null
        paymentByOrderIdCache.set(orderId, payment)
        return {
          ...(order as unknown as Record<string, unknown>),
          payment,
          paymentStatus: (order as unknown as { paymentStatus?: string }).paymentStatus || payment?.status
        } as unknown as Order
      } catch {
        // fall through
      }
    }

    paymentByOrderIdCache.set(orderId, null)
    return order
  }
}

export const fetchOrdersThunk = createAsyncThunk<FetchOrdersPayload, OrderFilter | undefined>(
  'order/fetchOrders',
  async (params, { rejectWithValue }) => {
    const requestKey = getOrderListRequestKey(params)
    try {
      inFlightOrderListRequests.add(requestKey)
      const response = await orderApi.getMyOrders(params)
      const hydratedItems = await mapWithConcurrency(response.data, 6, hydrateOrderPayment)
      return {
        items: hydratedItems,
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
      const hydratedItems = await mapWithConcurrency(response.data, 6, hydrateOrderPayment)
      return {
        items: hydratedItems,
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
      return await hydrateOrderPayment(response.data)
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
