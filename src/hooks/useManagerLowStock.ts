import { useState, useEffect, useCallback, useRef } from 'react'
import { storeInventoryApi } from '@/apis/storeInventory'
import type { PaginatedResponse, StoreInventoryRecord } from '@/types/api'
import { extractApiError } from '@/utils/apiError'

const useManagerLowStock = (branchId: string | null, limit = 5) => {
  const [data, setData] = useState<PaginatedResponse<StoreInventoryRecord> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeRef = useRef(true)

  const fetchLowStock = useCallback(async (bid: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await storeInventoryApi.getLowStock(bid, { limit, sortBy: 'quantity', sortOrder: 'asc' })
      if (activeRef.current) setData(res)
    } catch (err) {
      if (activeRef.current) setError(extractApiError(err, 'Không thể tải sản phẩm sắp hết hàng'))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    if (!branchId) return
    activeRef.current = true
    fetchLowStock(branchId)
    return () => { activeRef.current = false }
  }, [branchId, fetchLowStock])

  const refresh = useCallback(() => {
    if (branchId) fetchLowStock(branchId)
  }, [branchId, fetchLowStock])

  return { data, loading, error, refresh }
}

export default useManagerLowStock
