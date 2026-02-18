import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type {
  DashboardData,
  DashboardFilter,
  BranchPerformanceData,
  BranchPerformanceFilter,
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

export const dashboardApi = {
  getDashboard: async (filter?: DashboardFilter): Promise<ApiResponse<DashboardData>> => {
    const response = await apiClient.get<ApiResponse<DashboardData>>(
      API_ENDPOINTS.STATISTICS.DASHBOARD,
      { params: filter }
    )
    return response.data
  },

  getBranchPerformance: async (
    filter?: BranchPerformanceFilter
  ): Promise<ApiResponse<BranchPerformanceData>> => {
    const response = await apiClient.get<ApiResponse<BranchPerformanceData>>(
      API_ENDPOINTS.STATISTICS.BRANCH_PERFORMANCE,
      { params: filter }
    )
    return response.data
  },

  getRevenue: async (filter?: RevenueFilter): Promise<ApiResponse<RevenueData>> => {
    const response = await apiClient.get<ApiResponse<RevenueData>>(
      API_ENDPOINTS.STATISTICS.REVENUE,
      { params: filter }
    )
    return response.data
  },

  getOrderStatistics: async (filter?: OrderStatisticsFilter): Promise<ApiResponse<OrderStatisticsData>> => {
    const response = await apiClient.get<ApiResponse<OrderStatisticsData>>(
      API_ENDPOINTS.STATISTICS.ORDERS,
      { params: filter }
    )
    return response.data
  },

  getProductStatistics: async (filter?: ProductStatisticsFilter): Promise<ApiResponse<ProductStatisticsData>> => {
    const response = await apiClient.get<ApiResponse<ProductStatisticsData>>(
      API_ENDPOINTS.STATISTICS.PRODUCTS,
      { params: filter }
    )
    return response.data
  },

  getBranchStatistics: async (filter?: BranchStatisticsFilter): Promise<ApiResponse<BranchStatisticsData>> => {
    const response = await apiClient.get<ApiResponse<BranchStatisticsData>>(
      API_ENDPOINTS.STATISTICS.BRANCHES,
      { params: filter }
    )
    return response.data
  },

  getCustomerStatistics: async (filter?: CustomerStatisticsFilter): Promise<ApiResponse<CustomerStatisticsData>> => {
    const response = await apiClient.get<ApiResponse<CustomerStatisticsData>>(
      API_ENDPOINTS.STATISTICS.CUSTOMERS,
      { params: filter }
    )
    return response.data
  },

  getPaymentStatistics: async (filter?: PaymentStatisticsFilter): Promise<ApiResponse<PaymentStatisticsData>> => {
    const response = await apiClient.get<ApiResponse<PaymentStatisticsData>>(
      API_ENDPOINTS.STATISTICS.PAYMENTS,
      { params: filter }
    )
    return response.data
  },

  getInventoryStatistics: async (filter?: InventoryStatisticsFilter): Promise<ApiResponse<InventoryStatisticsData>> => {
    const response = await apiClient.get<ApiResponse<InventoryStatisticsData>>(
      API_ENDPOINTS.STATISTICS.INVENTORY,
      { params: filter }
    )
    return response.data
  },

  getComparison: async (filter?: ComparisonFilter): Promise<ApiResponse<ComparisonData>> => {
    const response = await apiClient.get<ApiResponse<ComparisonData>>(
      API_ENDPOINTS.STATISTICS.COMPARISON,
      { params: filter }
    )
    return response.data
  },

  getRecentOrders: async (filter?: RecentOrdersFilter): Promise<PaginatedResponse<RecentOrderItem>> => {
    const response = await apiClient.get<PaginatedResponse<RecentOrderItem>>(
      API_ENDPOINTS.STATISTICS.RECENT_ORDERS,
      { params: filter }
    )
    return response.data
  },

  getOrderStatusSummary: async (filter?: OrderStatusSummaryFilter): Promise<ApiResponse<OrderStatusSummaryData>> => {
    const response = await apiClient.get<ApiResponse<OrderStatusSummaryData>>(
      API_ENDPOINTS.STATISTICS.ORDER_STATUS_SUMMARY,
      { params: filter }
    )
    return response.data
  }
}

export default dashboardApi
