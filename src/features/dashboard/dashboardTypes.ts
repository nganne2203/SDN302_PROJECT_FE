export type DashboardPeriod =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom'

export interface DashboardFilter {
  period?: DashboardPeriod
  branchId?: string
  startDate?: string
  endDate?: string
}

export interface DashboardDateRange {
  startDate: string
  endDate: string
}

export interface DashboardOverview {
  totalOrders: number
  totalRevenue: number
  totalProductsSold: number
  totalCustomers: number
  averageOrderValue: number
}

export interface DashboardOrders {
  total: number
  pending: number
  confirmed: number
  shipped: number
  delivered: number
  canceled: number
  activeTransactions: number
}

export interface DashboardRevenue {
  total: number
  averageOrderValue: number
}

export interface DashboardProducts {
  totalActive: number
  totalSold: number
  lowStock: number
  outOfStock: number
}

export interface DashboardCustomers {
  newCustomers: number
}

export interface DashboardPerformance {
  completionRate: number
  successRate: number
}

export interface RecentOrder {
  _id: string
  orderNumber: string
  customer?: {
    _id: string
    fullname: string
    email: string
  }
  totalAmount: number
  status: string
  createdAt: string
  branch?: {
    _id: string
    name: string
  }
}

export interface DashboardData {
  period: DashboardPeriod
  dateRange: DashboardDateRange
  overview: DashboardOverview
  orders: DashboardOrders
  revenue: DashboardRevenue
  products: DashboardProducts
  customers: DashboardCustomers
  performance: DashboardPerformance
  recentOrders: RecentOrder[]
}

// Branch performance types
export interface BranchPerformanceFilter {
  period?: DashboardPeriod
  limit?: number
  startDate?: string
  endDate?: string
}

export interface BranchPerformanceItem {
  branchId: string
  branchName: string
  address: string
  manager: string
  managerEmail: string
  revenue: number
  orders: number
  quantity: number
  status: string
}

export interface BranchPerformanceSummary {
  totalBranches: number
  totalRevenue: number
  totalOrders: number
  totalQuantity: number
}

export interface BranchPerformanceData {
  period: DashboardPeriod
  dateRange: DashboardDateRange
  branches: BranchPerformanceItem[]
  summary: BranchPerformanceSummary
}
