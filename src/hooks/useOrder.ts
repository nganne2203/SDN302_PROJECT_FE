import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import {
  fetchOrdersThunk,
  fetchOrderByIdThunk,
  createOrderThunk,
  cancelOrderThunk
} from '@/features/order/orderThunks'
import { setSelectedOrder, clearError, clearOrders } from '@/features/order/orderSlices'
import type { CreateOrderRequest, Order } from '@/types/api'
import type { PaginationParams } from '@/types/pagination'

export const useOrder = () => {
  const dispatch = useAppDispatch()
  const { orders, selectedOrder, pagination, isLoading, error } =
    useAppSelector((state) => state.order)

  const fetchOrders = useCallback(
    (params?: PaginationParams) => {
      dispatch(fetchOrdersThunk(params))
    },
    [dispatch]
  )

  const fetchOrderById = useCallback(
    (id: string) => {
      dispatch(fetchOrderByIdThunk(id))
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
    async (id: string) => {
      const result = await dispatch(cancelOrderThunk(id))
      return cancelOrderThunk.fulfilled.match(result)
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
    fetchOrderById,
    createOrder,
    cancelOrder,
    selectOrder,
    clearOrderError,
    resetOrders
  }
}

export default useOrder
