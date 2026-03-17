import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Col, DatePicker, Empty, Pagination, Row, Select, Skeleton, Space, Statistic, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ReloadOutlined
} from '@ant-design/icons'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import dayjs, { type Dayjs } from 'dayjs'
import statisticsApi from '@/apis/statistics'
import { HTTP_STATUS, ROUTES } from '@/constants/constant'
import useDebounce from '@/hooks/useDebounce'
import useCachedQuery from '@/hooks/useCachedQuery'
import type {
  DashboardFilter,
  DashboardPeriod,
  DashboardData,
  InventoryStatisticsData,
  OrderStatisticsData,
  OrderStatusSummaryData,
  ProductStatisticsData,
  RecentOrderItem
} from '@/features/dashboard/dashboardTypes'
import type { PaginatedResponse } from '@/types/api'
import { extractApiError } from '@/utils/apiError'
import { formatCurrency } from '@/utils/formatCurrency'
import { toast } from '@/utils/toast'

const { RangePicker } = DatePicker

const COLORS = ['#1890ff', '#13c2c2', '#faad14', '#52c41a', '#eb2f96', '#722ed1']

const PERIOD_OPTIONS: Array<{ label: string; value: DashboardPeriod }> = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Hôm qua', value: 'yesterday' },
  { label: 'Tuần này', value: 'this_week' },
  { label: 'Tuần trước', value: 'last_week' },
  { label: 'Tháng này', value: 'this_month' },
  { label: 'Tháng trước', value: 'last_month' },
  { label: 'Quý này', value: 'this_quarter' },
  { label: 'Năm nay', value: 'this_year' },
  { label: 'Năm trước', value: 'last_year' },
  { label: 'Tùy chọn', value: 'custom' },
  { label: 'Tất cả', value: 'all' }
]

const renderEmpty = (description: string) => (
  <div className="py-8">
    <Empty description={description} />
  </div>
)

const getStatusColor = (status?: string) => {
  const s = (status ?? '').toLowerCase()
  if (s.includes('pending') || s.includes('chờ')) return 'gold'
  if (s.includes('confirm') || s.includes('xác nhận')) return 'blue'
  if (s.includes('ship') || s.includes('giao')) return 'cyan'
  if (s.includes('deliver') || s.includes('hoàn tất') || s.includes('đã giao')) return 'green'
  if (s.includes('cancel') || s.includes('hủy')) return 'red'
  return 'default'
}

const toISODateRange = (range: [Dayjs | null, Dayjs | null]) => {
  const [start, end] = range
  if (!start || !end) return null
  return {
    startDate: start.startOf('day').toISOString(),
    endDate: end.endOf('day').toISOString()
  }
}

const StaffReports = () => {
  const navigate = useNavigate()
  const notified403Ref = useRef(false)

  const [period, setPeriod] = useState<DashboardPeriod>('this_month')
  const [customRange, setCustomRange] = useState<[Dayjs | null, Dayjs | null]>([null, null])
  const [topLimit, setTopLimit] = useState<number>(10)

  const [recentPage, setRecentPage] = useState<number>(1)
  const [recentLimit, setRecentLimit] = useState<number>(10)

  const baseFilter: DashboardFilter = useMemo(() => {
    if (period !== 'custom') return { period }
    const iso = toISODateRange(customRange)
    return iso ? { period, ...iso } : { period }
  }, [customRange, period])

  const debouncedFilter = useDebounce(baseFilter, 250)
  const isCustomReady = period !== 'custom' || (!!debouncedFilter.startDate && !!debouncedFilter.endDate)

  const dashboardQuery = useCachedQuery<DashboardData>(
    ['staff-reports', 'dashboard', debouncedFilter],
    async () => (await statisticsApi.getDashboard(debouncedFilter)).data,
    { enabled: isCustomReady, staleTimeMs: 20_000 }
  )

  const ordersQuery = useCachedQuery<OrderStatisticsData>(
    ['staff-reports', 'orders', debouncedFilter],
    async () => (await statisticsApi.getOrders(debouncedFilter)).data,
    { enabled: isCustomReady, staleTimeMs: 20_000 }
  )

  const orderStatusSummaryQuery = useCachedQuery<OrderStatusSummaryData>(
    ['staff-reports', 'order-status-summary', debouncedFilter],
    async () => (await statisticsApi.getOrderStatusSummary(debouncedFilter)).data,
    { enabled: isCustomReady, staleTimeMs: 20_000 }
  )

  const productsQuery = useCachedQuery<ProductStatisticsData>(
    ['staff-reports', 'products', debouncedFilter, { limit: topLimit }],
    async () => (await statisticsApi.getProducts({ ...debouncedFilter, limit: topLimit })).data,
    { enabled: isCustomReady, staleTimeMs: 20_000 }
  )

  const inventoryQuery = useCachedQuery<InventoryStatisticsData>(
    ['staff-reports', 'inventory'],
    async () => (await statisticsApi.getInventory()).data,
    { enabled: true, staleTimeMs: 20_000 }
  )

  const recentOrdersQuery = useCachedQuery<PaginatedResponse<RecentOrderItem>>(
    ['staff-reports', 'recent-orders', debouncedFilter, { page: recentPage, limit: recentLimit }],
    async () => await statisticsApi.getRecentOrders({ ...debouncedFilter, page: recentPage, limit: recentLimit }),
    { enabled: isCustomReady, staleTimeMs: 15_000, keepPreviousData: true }
  )

  const handle403 = useCallback((err: unknown) => {
    const axiosError = err as AxiosError
    const status = axiosError.response?.status
    if (status === HTTP_STATUS.FORBIDDEN && !notified403Ref.current) {
      notified403Ref.current = true
      toast.error('Bạn không có quyền xem báo cáo.')
      navigate(ROUTES.MANAGEMENT.DASHBOARD, { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    const errors = [
      dashboardQuery.error,
      ordersQuery.error,
      orderStatusSummaryQuery.error,
      productsQuery.error,
      inventoryQuery.error,
      recentOrdersQuery.error
    ].filter(Boolean)

    for (const err of errors) handle403(err)
  }, [
    dashboardQuery.error,
    handle403,
    inventoryQuery.error,
    orderStatusSummaryQuery.error,
    ordersQuery.error,
    productsQuery.error,
    recentOrdersQuery.error
  ])

  const errorMessage = useMemo(() => {
    const firstError =
      dashboardQuery.error
      ?? ordersQuery.error
      ?? orderStatusSummaryQuery.error
      ?? productsQuery.error
      ?? inventoryQuery.error
      ?? recentOrdersQuery.error
    if (!firstError) return null
    const axiosError = firstError as AxiosError
    if (axiosError.response?.status === HTTP_STATUS.FORBIDDEN) return null
    return extractApiError(firstError, 'Không thể tải báo cáo')
  }, [
    dashboardQuery.error,
    inventoryQuery.error,
    orderStatusSummaryQuery.error,
    ordersQuery.error,
    productsQuery.error,
    recentOrdersQuery.error
  ])

  const orderStatusBreakdown = useMemo(() => {
    const source = ordersQuery.data?.statusBreakdown ?? []
    return (source as Array<{ status?: string; count?: number; percentage?: number }>).map((s) => ({
      status: s.status ?? 'Khác',
      count: s.count ?? 0,
      percentage: s.percentage ?? 0
    }))
  }, [ordersQuery.data])

  const orderStatusTableData = useMemo(() => {
    return (orderStatusSummaryQuery.data?.statuses ?? []) as Array<{
      status: string
      count: number
      percentage: number
      totalAmount: number
    }>
  }, [orderStatusSummaryQuery.data])

  const topSellingProducts = useMemo(() => {
    return (productsQuery.data?.topSellingProducts ?? []) as Array<{
      name?: string
      totalQuantity?: number
      totalRevenue?: number
    }>
  }, [productsQuery.data])

  const inventorySummary = useMemo(() => {
    const summary = (inventoryQuery.data?.summary ?? {}) as {
      totalQuantity?: number
      totalValue?: number
      lowStock?: number
      outOfStock?: number
    }
    return {
      totalQuantity: summary.totalQuantity ?? 0,
      totalValue: summary.totalValue ?? 0,
      lowStock: summary.lowStock ?? (inventoryQuery.data?.lowStockItems ?? []).length,
      outOfStock: summary.outOfStock ?? (inventoryQuery.data?.outOfStockItems ?? []).length
    }
  }, [inventoryQuery.data])

  const lowStockItems = useMemo(() => {
    return (inventoryQuery.data?.lowStockItems ?? []) as Array<{
      productName?: string
      branchName?: string
      quantity?: number
    }>
  }, [inventoryQuery.data])

  const outOfStockItems = useMemo(() => {
    return (inventoryQuery.data?.outOfStockItems ?? []) as Array<{
      productName?: string
      branchName?: string
      quantity?: number
    }>
  }, [inventoryQuery.data])

  const recentOrders = recentOrdersQuery.data?.data ?? []
  const recentPagination = recentOrdersQuery.data?.pagination

  const onRefreshAll = useCallback(async () => {
    await Promise.all([
      dashboardQuery.refetch(),
      ordersQuery.refetch(),
      orderStatusSummaryQuery.refetch(),
      productsQuery.refetch(),
      inventoryQuery.refetch(),
      recentOrdersQuery.refetch()
    ])
  }, [
    dashboardQuery,
    inventoryQuery,
    orderStatusSummaryQuery,
    ordersQuery,
    productsQuery,
    recentOrdersQuery
  ])

  const orderStatusColumns: ColumnsType<{ status: string; count: number; percentage: number; totalAmount: number }> = [
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => <Tag color={getStatusColor(value)}>{value}</Tag>
    },
    { title: 'Số lượng', dataIndex: 'count', key: 'count', align: 'right' },
    {
      title: 'Tỷ lệ',
      dataIndex: 'percentage',
      key: 'percentage',
      align: 'right',
      render: (value: number) => `${Number(value ?? 0).toFixed(1)}%`
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (value: number) => formatCurrency(Number(value ?? 0))
    }
  ]

  const productColumns: ColumnsType<{ name?: string; totalQuantity?: number; totalRevenue?: number }> = [
    { title: 'Sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Số lượng bán', dataIndex: 'totalQuantity', key: 'totalQuantity', align: 'right' },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      render: (value: number) => formatCurrency(Number(value ?? 0))
    }
  ]

  const inventoryColumns: ColumnsType<{ productName?: string; branchName?: string; quantity?: number }> = [
    { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
    { title: 'Chi nhánh', dataIndex: 'branchName', key: 'branchName' },
    { title: 'Tồn', dataIndex: 'quantity', key: 'quantity', align: 'right' }
  ]

  const recentColumns: ColumnsType<RecentOrderItem> = [
    { title: 'Mã đơn', dataIndex: 'orderNumber', key: 'orderNumber' },
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => <Tag color={getStatusColor(value)}>{value}</Tag>
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (value: number) => formatCurrency(Number(value ?? 0))
    },
    { title: 'Thanh toán', dataIndex: 'paymentMethod', key: 'paymentMethod' },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm')
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Báo cáo (Nhân viên)</h1>
          <p className="text-gray-500">Tổng quan KPI, đơn hàng, top sản phẩm, tồn kho và đơn gần đây</p>
        </div>

        <Space wrap>
          <Select
            value={period}
            onChange={(value) => {
              notified403Ref.current = false
              setRecentPage(1)
              setPeriod(value as DashboardPeriod)
              if (value !== 'custom') setCustomRange([null, null])
            }}
            style={{ width: 180 }}
            options={PERIOD_OPTIONS as unknown as Array<{ label: string; value: string }>}
          />

          {period === 'custom' && (
            <RangePicker
              value={customRange}
              onChange={(value) => {
                notified403Ref.current = false
                setRecentPage(1)
                setCustomRange(value as [Dayjs | null, Dayjs | null])
              }}
              allowEmpty={[false, false]}
            />
          )}

          <Button icon={<ReloadOutlined />} onClick={onRefreshAll} loading={dashboardQuery.isFetching || ordersQuery.isFetching}>
            Làm mới
          </Button>
        </Space>
      </div>

      {!isCustomReady && (
        <Alert type="info" showIcon message="Vui lòng chọn khoảng ngày để xem báo cáo." />
      )}

      {errorMessage && <Alert type="error" showIcon message={errorMessage} />}

      <Row gutter={[16, 16]}>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Tóm tắt đơn hàng">
            <div style={{ height: 360 }}>
              {ordersQuery.isLoading ? (
                <Skeleton active />
              ) : orderStatusBreakdown.length === 0 ? (
                renderEmpty('Chưa có dữ liệu đơn hàng')
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusBreakdown}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      label
                    >
                      {orderStatusBreakdown.map((_, index) => (
                        <Cell key={`order-breakdown-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Tóm tắt trạng thái đơn">
            <Table
              rowKey={(r) => r.status}
              columns={orderStatusColumns}
              dataSource={orderStatusTableData}
              loading={orderStatusSummaryQuery.isLoading}
              pagination={false}
              locale={{ emptyText: 'Chưa có dữ liệu' }}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Top sản phẩm"
            extra={(
              <Space>
                <span className="text-gray-500">Limit:</span>
                <Select
                  value={topLimit}
                  onChange={(value) => setTopLimit(Number(value))}
                  style={{ width: 90 }}
                  options={[
                    { label: '5', value: 5 },
                    { label: '10', value: 10 },
                    { label: '20', value: 20 }
                  ]}
                />
              </Space>
            )}
          >
            <div style={{ height: 280 }}>
              {productsQuery.isLoading ? (
                <Skeleton active />
              ) : topSellingProducts.length === 0 ? (
                renderEmpty('Chưa có dữ liệu sản phẩm')
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSellingProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalQuantity" name="Số lượng bán" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <Table
              rowKey={(r, idx) => `${r.name ?? 'product'}-${idx}`}
              columns={productColumns}
              dataSource={topSellingProducts}
              loading={productsQuery.isLoading}
              pagination={false}
              locale={{ emptyText: 'Chưa có dữ liệu' }}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Tồn kho (chi nhánh)">
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Card size="small">
                  <Statistic title="Tổng tồn" value={inventorySummary.totalQuantity} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic title="Giá trị tồn" value={inventorySummary.totalValue} formatter={(v) => formatCurrency(Number(v))} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic title="Sắp hết hàng" value={inventorySummary.lowStock} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic title="Hết hàng" value={inventorySummary.outOfStock} />
                </Card>
              </Col>
            </Row>

            <div className="mt-4 space-y-4">
              <Card size="small" title="Sắp hết hàng">
                <Table
                  rowKey={(r, idx) => `${r.productName ?? 'low'}-${idx}`}
                  columns={inventoryColumns}
                  dataSource={lowStockItems}
                  loading={inventoryQuery.isLoading}
                  pagination={false}
                  locale={{ emptyText: 'Không có' }}
                  size="small"
                />
              </Card>

              <Card size="small" title="Hết hàng">
                <Table
                  rowKey={(r, idx) => `${r.productName ?? 'out'}-${idx}`}
                  columns={inventoryColumns}
                  dataSource={outOfStockItems}
                  loading={inventoryQuery.isLoading}
                  pagination={false}
                  locale={{ emptyText: 'Không có' }}
                  size="small"
                />
              </Card>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="Đơn gần đây"
        extra={(
          <Space>
            <span className="text-gray-500">Hiển thị:</span>
            <Select
              value={recentLimit}
              onChange={(value) => {
                setRecentPage(1)
                setRecentLimit(Number(value))
              }}
              style={{ width: 110 }}
              options={[
                { label: '10', value: 10 },
                { label: '20', value: 20 },
                { label: '50', value: 50 }
              ]}
            />
          </Space>
        )}
      >
        <Table
          rowKey={(r) => `${r.orderNumber}-${r.createdAt}`}
          columns={recentColumns}
          dataSource={recentOrders}
          loading={recentOrdersQuery.isLoading || recentOrdersQuery.isFetching}
          pagination={false}
          locale={{ emptyText: 'Chưa có đơn hàng' }}
          size="middle"
        />

        {recentPagination && (
          <div className="flex justify-end mt-4">
            <Pagination
              current={recentPagination.currentPage}
              total={recentPagination.totalItems}
              pageSize={recentPagination.pageSize}
              onChange={(page) => setRecentPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

export default StaffReports

