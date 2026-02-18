import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse } from '@/types/api'
import type {
  DashboardData,
  DashboardFilter,
  BranchPerformanceData,
  BranchPerformanceFilter
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
  }
}

export default dashboardApi
