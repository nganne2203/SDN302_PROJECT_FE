import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type {
  DashboardData,
  DashboardFilter,
  OrderStatisticsData,
  OrderStatisticsFilter,
  ProductStatisticsData,
  ProductStatisticsFilter,
  InventoryStatisticsData,
  InventoryStatisticsFilter,
  RecentOrderItem,
  RecentOrdersFilter,
  OrderStatusSummaryData,
  OrderStatusSummaryFilter
} from '@/features/dashboard/dashboardTypes'

export const statisticsApi = {
  getDashboard: async (filter?: DashboardFilter): Promise<ApiResponse<DashboardData>> => {
    const response = await apiClient.get<ApiResponse<DashboardData>>(
      API_ENDPOINTS.STATISTICS.DASHBOARD,
      { params: filter }
    )
    return response.data
  },

  getOrders: async (filter?: OrderStatisticsFilter): Promise<ApiResponse<OrderStatisticsData>> => {
    const response = await apiClient.get<ApiResponse<OrderStatisticsData>>(
      API_ENDPOINTS.STATISTICS.ORDERS,
      { params: filter }
    )
    return response.data
  },

  getProducts: async (filter?: ProductStatisticsFilter): Promise<ApiResponse<ProductStatisticsData>> => {
    const response = await apiClient.get<ApiResponse<ProductStatisticsData>>(
      API_ENDPOINTS.STATISTICS.PRODUCTS,
      { params: filter }
    )
    return response.data
  },

  getInventory: async (filter?: InventoryStatisticsFilter): Promise<ApiResponse<InventoryStatisticsData>> => {
    const response = await apiClient.get<ApiResponse<InventoryStatisticsData>>(
      API_ENDPOINTS.STATISTICS.INVENTORY,
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

export default statisticsApi

