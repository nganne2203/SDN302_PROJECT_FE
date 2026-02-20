import { useState, useEffect, useCallback, useRef } from 'react'
import dashboardApi from '@/apis/dashboard'
import type {
  BranchPerformanceData,
  BranchPerformanceFilter,
  DashboardPeriod
} from '@/features/dashboard/dashboardTypes'

const useBranchPerformance = (
  initialPeriod: DashboardPeriod = 'this_month',
  initialLimit = 10
) => {
  const [data, setData] = useState<BranchPerformanceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<BranchPerformanceFilter>({
    period: initialPeriod,
    limit: initialLimit
  })
  const activeRef = useRef(true)

  const fetchData = useCallback(async (currentFilter: BranchPerformanceFilter) => {
    setLoading(true)
    setError(null)
    try {
      const res = await dashboardApi.getBranchPerformance(currentFilter)
      if (activeRef.current) {
        setData(res.data ?? null)
      }
    } catch (err: unknown) {
      if (activeRef.current) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Không thể tải dữ liệu hiệu suất chi nhánh'
        setError(msg)
      }
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    activeRef.current = true
    fetchData(filter)
    return () => {
      activeRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)])

  const handleFilterChange = useCallback((changes: Partial<BranchPerformanceFilter>) => {
    setFilter((prev) => ({ ...prev, ...changes }))
  }, [])

  const refresh = useCallback(() => {
    fetchData(filter)
  }, [fetchData, filter])

  return { data, loading, error, filter, handleFilterChange, refresh }
}

export default useBranchPerformance
