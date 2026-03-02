import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import {
  fetchOrdersThunk,
  fetchAllOrdersThunk,
  fetchOrderByIdThunk,
  createOrderThunk,
  cancelOrderThunk,
  updateOrderStatusThunk
} from '@/features/order/orderThunks'
import { setSelectedOrder, clearError, clearOrders } from '@/features/order/orderSlices'
import type { CreateOrderRequest, Order } from '@/types/api'
import type { OrderFilter } from '@/features/order/orderTypes'

export const useOrder = () => {
  const dispatch = useAppDispatch()
  const { orders, selectedOrder, pagination, isLoading, error } =
    useAppSelector((state) => state.order)

  const fetchOrders = useCallback(
    (params?: OrderFilter) => {
      dispatch(fetchOrdersThunk(params))
    },
    [dispatch]
  )

  const fetchAllOrders = useCallback(
    (params?: OrderFilter) => {
      dispatch(fetchAllOrdersThunk(params))
    },
    [dispatch]
  )

  const fetchOrderById = useCallback(
    async (id: string) => {
      const result = await dispatch(fetchOrderByIdThunk(id))
      if (fetchOrderByIdThunk.fulfilled.match(result)) {
        return result.payload
      }
      return null
    },
    [dispatch]
  )

  const createOrder = useCallback(
    async (data: CreateOrderRequest) => {
      const result = await dispatch(createOrderThunk(data))
      return createOrderThunk.fulfilled.match(result)
    },
    [dispatch]
  )

  const cancelOrder = useCallback(
    async (id: string, reason?: string) => {
      const result = await dispatch(cancelOrderThunk({ orderId: id, reason }))
      return cancelOrderThunk.fulfilled.match(result)
    },
    [dispatch]
  )

  const updateOrderStatus = useCallback(
    async (orderId: string, status: string) => {
      const result = await dispatch(updateOrderStatusThunk({ orderId, status }))
      return updateOrderStatusThunk.fulfilled.match(result)
    },
    [dispatch]
  )

  const selectOrder = useCallback(
    (order: Order | null) => {
      dispatch(setSelectedOrder(order))
    },
    [dispatch]
  )

  const clearOrderError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const resetOrders = useCallback(() => {
    dispatch(clearOrders())
  }, [dispatch])

  return {
    orders,
    selectedOrder,
    pagination,
    isLoading,
    error,
    fetchOrders,
    fetchAllOrders,
    fetchOrderById,
    createOrder,
    cancelOrder,
    updateOrderStatus,
    selectOrder,
    clearOrderError,
    resetOrders
  }
}

export default useOrder
