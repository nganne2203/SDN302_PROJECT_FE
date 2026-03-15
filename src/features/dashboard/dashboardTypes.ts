export type DashboardPeriod =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'last_year'
  | 'custom'
  | 'all'

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
  pendingProcessing?: number
  confirmedOrders?: number
  shippedOrders?: number
  deliveredOrders?: number
  cancelledOrders?: number
}

export interface DashboardOrders {
  total: number
  pending: number
  pendingProcessing?: number
  confirmed: number
  shipped: number
  delivered: number
  cancelled: number
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
  _id?: string
  orderNumber: string
  customer?: string
  totalAmount: number
  status: string
  paymentMethod?: string
  createdAt: string
  branch?: string
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

// ========================
// Revenue Statistics
// ========================
export interface RevenueFilter {
  period?: DashboardPeriod
  groupBy?: 'hour' | 'day' | 'week' | 'month' | 'year'
  branchId?: string
  startDate?: string
  endDate?: string
}

export interface RevenueSummary {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
}

export interface RevenueDataItem {
  date?: string
  hour?: number
  revenue: number
  orders: number
}

export interface RevenueData {
  period: DashboardPeriod
  groupBy: string
  dateRange: DashboardDateRange
  data: RevenueDataItem[]
  summary: RevenueSummary
}

// ========================
// Order Statistics
// ========================
export interface OrderStatisticsFilter {
  period?: DashboardPeriod
  branchId?: string
  startDate?: string
  endDate?: string
}

export interface OrderStatisticsData {
  period: DashboardPeriod
  dateRange: DashboardDateRange
  summary: Record<string, unknown>
  statusBreakdown: { status: string; count: number; percentage: number }[]
  dailyTrend: Record<string, unknown>[]
  peakHours: Record<string, unknown>[]
}

// ========================
// Product Statistics
// ========================
export interface ProductStatisticsFilter {
  period?: DashboardPeriod
  limit?: number
  branchId?: string
  startDate?: string
  endDate?: string
}

export interface ProductStatisticsData {
  period: DashboardPeriod
  dateRange: DashboardDateRange
  topSellingProducts: Record<string, unknown>[]
  topRevenueProducts: Record<string, unknown>[]
  byCategory: Record<string, unknown>[]
}

// ========================
// Branch Statistics
// ========================
export interface BranchStatisticsFilter {
  period?: DashboardPeriod
  startDate?: string
  endDate?: string
}

export interface BranchStatisticsData {
  period: DashboardPeriod
  dateRange: DashboardDateRange
  branches: Record<string, unknown>[]
  comparison: Record<string, unknown>
}

// ========================
// Customer Statistics
// ========================
export interface CustomerStatisticsFilter {
  period?: DashboardPeriod
  limit?: number
  startDate?: string
  endDate?: string
}

export interface CustomerStatisticsData {
  period: DashboardPeriod
  dateRange: DashboardDateRange
  summary: Record<string, unknown>
  topCustomers: Record<string, unknown>[]
  newCustomers: Record<string, unknown>[]
  orderFrequency: Record<string, unknown>
}

// ========================
// Payment Statistics
// ========================
export interface PaymentStatisticsFilter {
  period?: DashboardPeriod
  branchId?: string
  startDate?: string
  endDate?: string
}

export interface PaymentStatisticsData {
  period: DashboardPeriod
  dateRange: DashboardDateRange
  summary: Record<string, unknown>
  byMethod: Record<string, unknown>[]
  byStatus: Record<string, unknown>[]
  vnpayBanks: Record<string, unknown>[]
}

// ========================
// Inventory Statistics
// ========================
export interface InventoryStatisticsFilter {
  branchId?: string
}

export interface InventoryStatisticsData {
  summary: Record<string, unknown>
  lowStockItems: Record<string, unknown>[]
  outOfStockItems: Record<string, unknown>[]
  stockByBranch: Record<string, unknown>[]
}

// ========================
// Comparison Statistics
// ========================
export interface ComparisonFilter {
  currentPeriod?: DashboardPeriod
  previousPeriod?: DashboardPeriod
  branchId?: string
}

export interface ComparisonData {
  currentPeriod: Record<string, unknown>
  previousPeriod: Record<string, unknown>
  comparison: Record<string, unknown>
}

// ========================
// Recent Orders
// ========================
export interface RecentOrdersFilter {
  period?: DashboardPeriod
  limit?: number
  page?: number
  branchId?: string
  startDate?: string
  endDate?: string
}

export interface RecentOrderItem {
  orderNumber: string
  customer: string
  email: string
  phone: string
  status: string
  totalAmount: number
  paymentMethod: string
  branch: string
  createdAt: string
}

// ========================
// Order Status Summary
// ========================
export interface OrderStatusSummaryFilter {
  period?: DashboardPeriod
  branchId?: string
  startDate?: string
  endDate?: string
}

export interface OrderStatusItem {
  status: string
  count: number
  percentage: number
  totalAmount: number
}

export interface OrderStatusSummaryData {
  statuses: OrderStatusItem[]
  summary: Record<string, unknown>
}
