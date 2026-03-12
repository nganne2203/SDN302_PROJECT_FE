import { useState, useEffect, useCallback, useRef } from 'react'
import { orderApi } from '@/apis/order'
import type { PaginatedResponse, Order } from '@/types/api'
import { extractApiError } from '@/utils/apiError'

export interface ManagerOrdersFilter {
  page?: number
  limit?: number
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  sortBy?: 'createdAt' | 'totalAmount' | 'orderNumber'
  sortOrder?: 'asc' | 'desc'
}

const useManagerOrders = (initialFilter: ManagerOrdersFilter = { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }) => {
  const [data, setData] = useState<PaginatedResponse<Order> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ManagerOrdersFilter>(initialFilter)
  const activeRef = useRef(true)

  const fetchOrders = useCallback(async (params: ManagerOrdersFilter) => {
    setLoading(true)
    setError(null)
    try {
      const res = await orderApi.getAllOrders(params)
      if (activeRef.current) setData(res)
    } catch (err) {
      if (activeRef.current) setError(extractApiError(err, 'Không thể tải danh sách đơn hàng'))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    activeRef.current = true
    fetchOrders(filter)
    return () => { activeRef.current = false }
  }, [filter, fetchOrders])

  const handleFilterChange = useCallback((changes: Partial<ManagerOrdersFilter>) => {
    setFilter(prev => ({ ...prev, ...changes }))
  }, [])

  const refresh = useCallback(() => fetchOrders(filter), [fetchOrders, filter])

  return { data, loading, error, filter, handleFilterChange, refresh }
}

export default useManagerOrders
