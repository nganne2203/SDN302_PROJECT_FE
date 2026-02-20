import { useState, useEffect, useCallback, useRef } from 'react'
import { stockRequestApi } from '@/apis/stockRequest'
import type { PaginatedResponse, StockRequestRecord } from '@/types/api'
import { extractApiError } from '@/utils/apiError'

export interface ManagerStockRequestsFilter {
  page?: number
  limit?: number
  status?: 'pending' | 'approved' | 'rejected'
  sortBy?: 'createdAt' | 'quantity' | 'status'
  sortOrder?: 'asc' | 'desc'
}

const useManagerStockRequests = (
  branchId: string | null,
  initialFilter: ManagerStockRequestsFilter = { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }
) => {
  const [data, setData] = useState<PaginatedResponse<StockRequestRecord> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ManagerStockRequestsFilter>(initialFilter)
  const activeRef = useRef(true)

  const fetchRequests = useCallback(async (bid: string, params: ManagerStockRequestsFilter) => {
    setLoading(true)
    setError(null)
    try {
      const res = await stockRequestApi.getByBranch(bid, params)
      if (activeRef.current) setData(res)
    } catch (err) {
      if (activeRef.current) setError(extractApiError(err, 'Không thể tải yêu cầu nhập kho'))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!branchId) return
    activeRef.current = true
    fetchRequests(branchId, filter)
    return () => { activeRef.current = false }
  }, [branchId, filter, fetchRequests])

  const handleFilterChange = useCallback((changes: Partial<ManagerStockRequestsFilter>) => {
    setFilter(prev => ({ ...prev, ...changes }))
  }, [])

  const refresh = useCallback(() => {
    if (branchId) fetchRequests(branchId, filter)
  }, [branchId, fetchRequests, filter])

  return { data, loading, error, filter, handleFilterChange, refresh }
}

export default useManagerStockRequests
