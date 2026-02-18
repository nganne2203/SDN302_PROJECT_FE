import { useCallback, useEffect, useRef, useState } from 'react'
import dashboardApi from '@/apis/dashboard'
import { extractApiError } from '@/utils/apiError'
import type {
  DashboardPeriod,
  RevenueData,
  RevenueFilter,
  OrderStatisticsData,
  OrderStatisticsFilter,
  ProductStatisticsData,
  ProductStatisticsFilter,
  BranchStatisticsData,
  BranchStatisticsFilter,
  CustomerStatisticsData,
  CustomerStatisticsFilter,
  PaymentStatisticsData,
  PaymentStatisticsFilter,
  InventoryStatisticsData,
  InventoryStatisticsFilter,
  ComparisonData,
  ComparisonFilter,
  RecentOrderItem,
  RecentOrdersFilter,
  OrderStatusSummaryData,
  OrderStatusSummaryFilter
} from '@/features/dashboard/dashboardTypes'
import type { PaginationMeta } from '@/types/api'

// ========================
// Revenue Statistics Hook
// ========================
export const useRevenueStatistics = (initialPeriod: DashboardPeriod = 'this_month') => {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<RevenueFilter>({ period: initialPeriod, groupBy: 'day' })
  const activeRef = useRef(true)

  const fetchRevenue = useCallback(async (params?: RevenueFilter) => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardApi.getRevenue(params ?? filter)
      if (activeRef.current) setData(response.data)
    } catch (err) {
      if (activeRef.current) setError(extractApiError(err, 'Không thể tải thống kê doanh thu'))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    activeRef.current = true
    fetchRevenue(filter)
    return () => { activeRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)])

  const handleFilterChange = useCallback((changes: Partial<RevenueFilter>) => {
    setFilter(prev => ({ ...prev, ...changes }))
  }, [])

  const refresh = useCallback(() => fetchRevenue(filter), [fetchRevenue, filter])

  return { data, loading, error, filter, handleFilterChange, refresh }
}

// ========================
// Order Statistics Hook
// ========================
export const useOrderStatistics = (initialPeriod: DashboardPeriod = 'this_month') => {
  const [data, setData] = useState<OrderStatisticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<OrderStatisticsFilter>({ period: initialPeriod })
  const activeRef = useRef(true)

  const fetchOrderStats = useCallback(async (params?: OrderStatisticsFilter) => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardApi.getOrderStatistics(params ?? filter)
      if (activeRef.current) setData(response.data)
    } catch (err) {
      if (activeRef.current) setError(extractApiError(err, 'Không thể tải thống kê đơn hàng'))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    activeRef.current = true
    fetchOrderStats(filter)
    return () => { activeRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)])

  const handleFilterChange = useCallback((changes: Partial<OrderStatisticsFilter>) => {
    setFilter(prev => ({ ...prev, ...changes }))
  }, [])

  const refresh = useCallback(() => fetchOrderStats(filter), [fetchOrderStats, filter])

  return { data, loading, error, filter, handleFilterChange, refresh }
}

// ========================
// Product Statistics Hook
// ========================
export const useProductStatistics = (initialPeriod: DashboardPeriod = 'this_month') => {
  const [data, setData] = useState<ProductStatisticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ProductStatisticsFilter>({ period: initialPeriod, limit: 10 })
  const activeRef = useRef(true)

  const fetchProductStats = useCallback(async (params?: ProductStatisticsFilter) => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardApi.getProductStatistics(params ?? filter)
      if (activeRef.current) setData(response.data)
    } catch (err) {
      if (activeRef.current) setError(extractApiError(err, 'Không thể tải thống kê sản phẩm'))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    activeRef.current = true
    fetchProductStats(filter)
    return () => { activeRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)])

  const handleFilterChange = useCallback((changes: Partial<ProductStatisticsFilter>) => {
    setFilter(prev => ({ ...prev, ...changes }))
  }, [])

  const refresh = useCallback(() => fetchProductStats(filter), [fetchProductStats, filter])

  return { data, loading, error, filter, handleFilterChange, refresh }
}

// ========================
// Branch Statistics Hook (Admin only)
// ========================
export const useBranchStatistics = (initialPeriod: DashboardPeriod = 'this_month') => {
  const [data, setData] = useState<BranchStatisticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<BranchStatisticsFilter>({ period: initialPeriod })
  const activeRef = useRef(true)

  const fetchBranchStats = useCallback(async (params?: BranchStatisticsFilter) => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardApi.getBranchStatistics(params ?? filter)
      if (activeRef.current) setData(response.data)
    } catch (err) {
      if (activeRef.current) setError(extractApiError(err, 'Không thể tải thống kê chi nhánh'))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    activeRef.current = true
    fetchBranchStats(filter)
    return () => { activeRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)])

  const handleFilterChange = useCallback((changes: Partial<BranchStatisticsFilter>) => {
    setFilter(prev => ({ ...prev, ...changes }))
  }, [])

  const refresh = useCallback(() => fetchBranchStats(filter), [fetchBranchStats, filter])

  return { data, loading, error, filter, handleFilterChange, refresh }
}

// ========================
// Customer Statistics Hook
// ========================
export const useCustomerStatistics = (initialPeriod: DashboardPeriod = 'this_month') => {
  const [data, setData] = useState<CustomerStatisticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<CustomerStatisticsFilter>({ period: initialPeriod, limit: 10 })
  const activeRef = useRef(true)

  const fetchCustomerStats = useCallback(async (params?: CustomerStatisticsFilter) => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardApi.getCustomerStatistics(params ?? filter)
      if (activeRef.current) setData(response.data)
    } catch (err) {
      if (activeRef.current) setError(extractApiError(err, 'Không thể tải thống kê khách hàng'))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    activeRef.current = true
    fetchCustomerStats(filter)
    return () => { activeRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)])

  const handleFilterChange = useCallback((changes: Partial<CustomerStatisticsFilter>) => {
    setFilter(prev => ({ ...prev, ...changes }))
  }, [])

  const refresh = useCallback(() => fetchCustomerStats(filter), [fetchCustomerStats, filter])

  return { data, loading, error, filter, handleFilterChange, refresh }
}

// ========================
// Payment Statistics Hook
// ========================
export const usePaymentStatistics = (initialPeriod: DashboardPeriod = 'this_month') => {
  const [data, setData] = useState<PaymentStatisticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<PaymentStatisticsFilter>({ period: initialPeriod })
  const activeRef = useRef(true)

  const fetchPaymentStats = useCallback(async (params?: PaymentStatisticsFilter) => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardApi.getPaymentStatistics(params ?? filter)
      if (activeRef.current) setData(response.data)
    } catch (err) {
      if (activeRef.current) setError(extractApiError(err, 'Không thể tải thống kê thanh toán'))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    activeRef.current = true
    fetchPaymentStats(filter)
    return () => { activeRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)])

  const handleFilterChange = useCallback((changes: Partial<PaymentStatisticsFilter>) => {
    setFilter(prev => ({ ...prev, ...changes }))
  }, [])

  const refresh = useCallback(() => fetchPaymentStats(filter), [fetchPaymentStats, filter])

  return { data, loading, error, filter, handleFilterChange, refresh }
}

// ========================
// Inventory Statistics Hook
// ========================
export const useInventoryStatistics = (branchId?: string) => {
  const [data, setData] = useState<InventoryStatisticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<InventoryStatisticsFilter>({ branchId })
  const activeRef = useRef(true)

  const fetchInventoryStats = useCallback(async (params?: InventoryStatisticsFilter) => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardApi.getInventoryStatistics(params ?? filter)
      if (activeRef.current) setData(response.data)
    } catch (err) {
      if (activeRef.current) setError(extractApiError(err, 'Không thể tải thống kê tồn kho'))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    activeRef.current = true
    fetchInventoryStats(filter)
    return () => { activeRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)])

  const handleFilterChange = useCallback((changes: Partial<InventoryStatisticsFilter>) => {
    setFilter(prev => ({ ...prev, ...changes }))
  }, [])

  const refresh = useCallback(() => fetchInventoryStats(filter), [fetchInventoryStats, filter])

  return { data, loading, error, filter, handleFilterChange, refresh }
}

// ========================
// Comparison Statistics Hook
// ========================
export const useComparisonStatistics = () => {
  const [data, setData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ComparisonFilter>({
    currentPeriod: 'this_month',
    previousPeriod: 'last_month'
  })
  const activeRef = useRef(true)

  const fetchComparison = useCallback(async (params?: ComparisonFilter) => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardApi.getComparison(params ?? filter)
      if (activeRef.current) setData(response.data)
    } catch (err) {
      if (activeRef.current) setError(extractApiError(err, 'Không thể tải dữ liệu so sánh'))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    activeRef.current = true
    fetchComparison(filter)
    return () => { activeRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)])

  const handleFilterChange = useCallback((changes: Partial<ComparisonFilter>) => {
    setFilter(prev => ({ ...prev, ...changes }))
  }, [])

  const refresh = useCallback(() => fetchComparison(filter), [fetchComparison, filter])

  return { data, loading, error, filter, handleFilterChange, refresh }
}

// ========================
// Recent Orders Hook
// ========================
export const useRecentOrders = (initialFilter?: Partial<RecentOrdersFilter>) => {
  const [data, setData] = useState<RecentOrderItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<RecentOrdersFilter>({
    period: 'this_month',
    limit: 10,
    page: 1,
    ...initialFilter
  })
  const activeRef = useRef(true)

  const fetchRecentOrders = useCallback(async (params?: RecentOrdersFilter) => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardApi.getRecentOrders(params ?? filter)
      if (activeRef.current) {
        setData(response.data)
        setPagination(response.pagination)
      }
    } catch (err) {
      if (activeRef.current) setError(extractApiError(err, 'Không thể tải đơn hàng gần đây'))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    activeRef.current = true
    fetchRecentOrders(filter)
    return () => { activeRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)])

  const handleFilterChange = useCallback((changes: Partial<RecentOrdersFilter>) => {
    setFilter(prev => ({ ...prev, ...changes }))
  }, [])

  const refresh = useCallback(() => fetchRecentOrders(filter), [fetchRecentOrders, filter])

  return { data, pagination, loading, error, filter, handleFilterChange, refresh }
}

// ========================
// Order Status Summary Hook
// ========================
export const useOrderStatusSummary = (initialPeriod: DashboardPeriod = 'this_month') => {
  const [data, setData] = useState<OrderStatusSummaryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<OrderStatusSummaryFilter>({ period: initialPeriod })
  const activeRef = useRef(true)

  const fetchSummary = useCallback(async (params?: OrderStatusSummaryFilter) => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardApi.getOrderStatusSummary(params ?? filter)
      if (activeRef.current) setData(response.data)
    } catch (err) {
      if (activeRef.current) setError(extractApiError(err, 'Không thể tải tóm tắt trạng thái đơn hàng'))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    activeRef.current = true
    fetchSummary(filter)
    return () => { activeRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)])

  const handleFilterChange = useCallback((changes: Partial<OrderStatusSummaryFilter>) => {
    setFilter(prev => ({ ...prev, ...changes }))
  }, [])

  const refresh = useCallback(() => fetchSummary(filter), [fetchSummary, filter])

  return { data, loading, error, filter, handleFilterChange, refresh }
}
