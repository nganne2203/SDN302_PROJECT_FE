import { useCallback, useEffect, useRef, useState } from 'react'
import dashboardApi from '@/apis/dashboard'
import type { DashboardData, DashboardFilter, DashboardPeriod } from '@/features/dashboard/dashboardTypes'
import { extractApiError } from '@/utils/apiError'

export const useDashboard = (initialPeriod: DashboardPeriod = 'this_month') => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<DashboardFilter>({ period: initialPeriod })
  const activeRef = useRef(true)

  const fetchDashboard = useCallback(async (params?: DashboardFilter) => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardApi.getDashboard(params ?? filter)
      if (activeRef.current) {
        setData(response.data)
      }
    } catch (err) {
      if (activeRef.current) {
        setError(extractApiError(err, 'Không thể tải dữ liệu dashboard'))
      }
    } finally {
      if (activeRef.current) {
        setLoading(false)
      }
    }
  }, [filter])

  useEffect(() => {
    activeRef.current = true
    fetchDashboard(filter)
    return () => { activeRef.current = false }
  }, [filter, fetchDashboard])

  const handleFilterChange = useCallback((newFilter: Partial<DashboardFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }))
  }, [])

  const refresh = useCallback(() => {
    fetchDashboard(filter)
  }, [fetchDashboard, filter])

  return {
    data,
    loading,
    error,
    filter,
    handleFilterChange,
    refresh
  }
}

export default useDashboard
