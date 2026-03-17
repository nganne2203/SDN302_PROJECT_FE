import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Col, Empty, Row, Select, Space, Spin, Statistic, Table, Tabs } from 'antd'
import {
  DollarOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  BarChartOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import dayjs from 'dayjs'
import useAuth from '@/hooks/useAuth'
import dashboardApi from '@/apis/dashboard'
import branchApi from '@/apis/branch'
import type {
  DashboardData,
  OrderStatusSummaryData,
  PaymentStatisticsData,
  ProductStatisticsData,
  RevenueData
} from '@/features/dashboard/dashboardTypes'
import type { Branch } from '@/types/api'
import { formatCurrency } from '@/utils/formatCurrency'
import OrderStatusBadge from '@/components/order/OrderStatusBadge'

const COLORS = ['#1890ff', '#13c2c2', '#faad14', '#52c41a', '#eb2f96', '#722ed1']
const PERIOD_OPTIONS = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Tuần này', value: 'this_week' },
  { label: 'Tháng này', value: 'this_month' },
  { label: 'Tháng trước', value: 'last_month' },
  { label: 'Năm nay', value: 'this_year' }
] as const

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  canceled: 'Đã hủy'
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  cash: 'Tiền mặt',
  banking: 'Chuyển khoản',
  bank_transfer: 'Chuyển khoản',
  vnpay: 'VNPay',
  momo: 'MoMo',
  card: 'Thẻ'
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Đang chờ thanh toán',
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  completed: 'Hoàn tất',
  failed: 'Thanh toán thất bại',
  cancelled: 'Đã hủy thanh toán',
  canceled: 'Đã hủy thanh toán',
  refunded: 'Đã hoàn tiền',
  processing: 'Đang xử lý',
  success: 'Thành công'
}

type ReportPeriod = (typeof PERIOD_OPTIONS)[number]['value']

const normalizeFieldKey = (value: string) => value.trim().toLowerCase()

const mapOrderStatusLabel = (value: string) => ORDER_STATUS_LABELS[normalizeFieldKey(value)] || value

const mapPaymentMethodLabel = (value: string) => PAYMENT_METHOD_LABELS[normalizeFieldKey(value)] || value

const mapPaymentStatusLabel = (value: string) => PAYMENT_STATUS_LABELS[normalizeFieldKey(value)] || value

const pieTooltipFormatter = (
  value: number | string | undefined,
  _name: string | undefined,
  item?: { payload?: { methodLabel?: string; statusLabel?: string } }
) => {
  const label = item?.payload?.methodLabel || item?.payload?.statusLabel || ''
  return [value ?? 0, label]
}

const barTooltipFormatter = (value: number | string | undefined, name: string | undefined) => [value ?? 0, name ?? '']

const renderEmpty = (description: string) => (
  <div className="py-8">
    <Empty description={description} />
  </div>
)

const ManagementReports = () => {
  const { user } = useAuth()
  const [period, setPeriod] = useState<ReportPeriod>('this_month')
  const [branchId, setBranchId] = useState<string>('')
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [paymentStats, setPaymentStats] = useState<PaymentStatisticsData | null>(null)
  const [orderStatus, setOrderStatus] = useState<OrderStatusSummaryData | null>(null)

  const isAdmin = user?.role === 'admin'

  const loadBranches = useCallback(async () => {
    if (!isAdmin) return

    try {
      const response = await branchApi.getAllBranches({ isActive: true })
      setBranches(response.data || [])
    } catch {
      setBranches([])
    }
  }, [isAdmin])

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [revenueRes, paymentRes, orderStatusRes] = await Promise.all([
        dashboardApi.getRevenue({ period, groupBy: 'day', branchId: branchId || undefined }),
        dashboardApi.getPaymentStatistics({ period, branchId: branchId || undefined }),
        dashboardApi.getOrderStatusSummary({ period, branchId: branchId || undefined })
      ])

      setRevenue(revenueRes.data)
      setPaymentStats(paymentRes.data)
      setOrderStatus(orderStatusRes.data)
    } catch {
      setError('Không thể tải báo cáo quản lý')
      setRevenue(null)
      setPaymentStats(null)
      setOrderStatus(null)
    } finally {
      setLoading(false)
    }
  }, [branchId, period])

  useEffect(() => {
    loadBranches().catch(() => undefined)
  }, [loadBranches])

  useEffect(() => {
    loadReports().catch(() => undefined)
  }, [loadReports])

  const revenueChartData = useMemo(() => revenue?.data || [], [revenue])

  const paymentMethodData = useMemo(() => {
    const source = paymentStats?.byMethod ?? {}
    return Object.entries(source as Record<string, { count?: number; totalAmount?: number; successRate?: number }>).map(([method, value]) => ({
      method,
      methodLabel: mapPaymentMethodLabel(method),
      count: value?.count ?? 0,
      totalAmount: value?.totalAmount ?? 0,
      successRate: value?.successRate ?? 0
    }))
  }, [paymentStats])

  const paymentStatusData = useMemo(() => {
    const source = paymentStats?.byStatus ?? {}
    return Object.entries(source as Record<string, { count?: number; totalAmount?: number }>).map(([status, value]) => ({
      status,
      statusLabel: mapPaymentStatusLabel(status),
      count: value?.count ?? 0,
      totalAmount: value?.totalAmount ?? 0
    }))
  }, [paymentStats])

  const orderStatusData = useMemo(
    () =>
      (orderStatus?.statuses || []).map((item) => ({
        ...item,
        statusLabel: mapOrderStatusLabel(item.status)
      })),
    [orderStatus]
  )

  return (
    <Spin spinning={loading}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Báo cáo & Thống kê</h1>
            <p className="text-gray-500">Theo dõi doanh thu, thanh toán và trạng thái đơn hàng</p>
          </div>
          <Space wrap>
            <Select
              value={period}
              onChange={(value) => setPeriod(value as ReportPeriod)}
              style={{ width: 180 }}
              options={PERIOD_OPTIONS as unknown as Array<{ label: string; value: string }>}
            />
            {isAdmin && (
              <Select
                value={branchId || undefined}
                onChange={(value) => setBranchId(value || '')}
                style={{ width: 220 }}
                placeholder="Tất cả chi nhánh"
                allowClear
                options={branches.map((b) => ({ label: `${b.name} - ${b.address}`, value: b._id }))}
              />
            )}
            <Button icon={<ReloadOutlined />} onClick={() => loadReports()} loading={loading}>
              Làm mới
            </Button>
          </Space>
        </div>

        {error && <Alert message={error} type="error" showIcon />}

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Tổng doanh thu"
                value={revenue?.summary?.totalRevenue || 0}
                prefix={<DollarOutlined className="text-green-600" />}
                formatter={(value) => formatCurrency(Number(value))}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Tổng đơn hàng"
                value={revenue?.summary?.totalOrders || 0}
                prefix={<ShoppingCartOutlined className="text-blue-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Giá trị đơn TB"
                value={revenue?.summary?.averageOrderValue || 0}
                prefix={<PercentageOutlined className="text-purple-600" />}
                formatter={(value) => formatCurrency(Number(value))}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Tổng trạng thái đơn"
                value={orderStatusData.reduce((acc, item) => acc + item.count, 0)}
                prefix={<BarChartOutlined className="text-orange-600" />}
              />
            </Card>
          </Col>
        </Row>

        <Tabs
          defaultActiveKey="revenue"
          items={[
            {
              key: 'revenue',
              label: 'Doanh thu',
              children: (
                <Card>
                  <div style={{ height: 360 }}>
                    {revenueChartData.length === 0 ? (
                      renderEmpty('Chưa có dữ liệu doanh thu')
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={(item) => (item as { date?: string; hour?: number }).date || (item as { hour?: number }).hour} />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#52c41a" strokeWidth={2} name="Doanh thu" />
                          <Line type="monotone" dataKey="orders" stroke="#1890ff" strokeWidth={2} name="Đơn hàng" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Card>
              )
            },
            {
              key: 'payment',
              label: 'Thanh toán',
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="Tỷ trọng phương thức thanh toán">
                      <div style={{ height: 320 }}>
                        {paymentMethodData.length === 0 ? (
                          renderEmpty('Chưa có dữ liệu phương thức thanh toán')
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={paymentMethodData}
                                dataKey="count"
                                nameKey="methodLabel"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                labelLine={false}
                              >
                                {paymentMethodData.map((_, index) => (
                                  <Cell key={`payment-method-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={pieTooltipFormatter} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Trạng thái thanh toán">
                      <div style={{ height: 320 }}>
                        {paymentStatusData.length === 0 ? (
                          renderEmpty('Chưa có dữ liệu trạng thái thanh toán')
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={paymentStatusData}
                                dataKey="count"
                                nameKey="statusLabel"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                labelLine={false}
                              >
                                {paymentStatusData.map((_, index) => (
                                  <Cell key={`payment-status-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={pieTooltipFormatter} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: 'orders',
              label: 'Trạng thái đơn hàng',
              children: (
                <Card>
                  <div style={{ height: 360 }}>
                    {orderStatusData.length === 0 ? (
                      renderEmpty('Chưa có dữ liệu trạng thái đơn hàng')
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={orderStatusData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="statusLabel" />
                          <YAxis />
                          <Tooltip formatter={barTooltipFormatter} />
                          <Legend />
                          <Bar dataKey="count" name="Số đơn" fill="#1890ff" />
                          <Bar dataKey="percentage" name="Tỷ lệ" fill="#52c41a" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Card>
              )
            }
          ]}
        />
      </div>
    </Spin>
  )
}

const StaffReports = () => {
  const [period, setPeriod] = useState<ReportPeriod>('this_month')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [productStats, setProductStats] = useState<ProductStatisticsData | null>(null)
  const [orderStatus, setOrderStatus] = useState<OrderStatusSummaryData | null>(null)
  const [recentOrders, setRecentOrders] = useState<Array<{
    orderNumber: string
    customer: string
    status: string
    totalAmount: number
    paymentMethod: string
    branch: string
    createdAt: string
  }>>([])

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [dashboardRes, productRes, orderStatusRes, recentOrdersRes] = await Promise.all([
        dashboardApi.getDashboard({ period }),
        dashboardApi.getProductStatistics({ period, limit: 8 }),
        dashboardApi.getOrderStatusSummary({ period }),
        dashboardApi.getRecentOrders({ period, limit: 8, page: 1 })
      ])

      setDashboard(dashboardRes.data)
      setProductStats(productRes.data)
      setOrderStatus(orderStatusRes.data)
      setRecentOrders(recentOrdersRes.data as typeof recentOrders)
    } catch {
      setError('Không thể tải báo cáo cho nhân viên')
      setDashboard(null)
      setProductStats(null)
      setOrderStatus(null)
      setRecentOrders([])
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadReports().catch(() => undefined)
  }, [loadReports])

  const topSellingProducts = useMemo(
    () => (productStats?.topSellingProducts ?? []) as Array<{ name?: string; totalQuantity?: number; totalRevenue?: number }>,
    [productStats]
  )

  const orderStatusData = useMemo(
    () =>
      (orderStatus?.statuses ?? []).map((item) => ({
        ...item,
        statusLabel: mapOrderStatusLabel(item.status)
      })),
    [orderStatus]
  )

  return (
    <Spin spinning={loading}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Báo cáo chi nhánh</h1>
            <p className="text-gray-500">Xem nhanh hiệu suất đơn hàng và sản phẩm bán chạy</p>
          </div>
          <Space wrap>
            <Select
              value={period}
              onChange={(value) => setPeriod(value as ReportPeriod)}
              style={{ width: 180 }}
              options={PERIOD_OPTIONS as unknown as Array<{ label: string; value: string }>}
            />
            <Button icon={<ReloadOutlined />} onClick={() => loadReports()} loading={loading}>
              Làm mới
            </Button>
          </Space>
        </div>

        {error && <Alert message={error} type="error" showIcon />}

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={12}>
            <Card hoverable>
              <Statistic
                title="Đơn hàng"
                value={dashboard?.overview.totalOrders ?? 0}
                prefix={<ShoppingCartOutlined className="text-blue-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <Card hoverable>
              <Statistic
                title="Doanh thu"
                value={dashboard?.overview.totalRevenue ?? 0}
                prefix={<DollarOutlined className="text-green-600" />}
                formatter={(value) => formatCurrency(Number(value))}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Top sản phẩm bán chạy">
              <div style={{ height: 360 }}>
                {topSellingProducts.length === 0 ? (
                  renderEmpty('Chưa có dữ liệu sản phẩm bán chạy')
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSellingProducts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalQuantity" name="Số lượng bán" fill="#1890ff" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Phân bổ trạng thái đơn">
              <div style={{ height: 360 }}>
                {orderStatusData.length === 0 ? (
                  renderEmpty('Chưa có dữ liệu trạng thái đơn hàng')
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        dataKey="count"
                        nameKey="statusLabel"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label
                      >
                        {orderStatusData.map((_, index) => (
                          <Cell key={`order-status-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={pieTooltipFormatter} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={24}>
            <Card title="Đơn hàng gần đây">
              <Table
                dataSource={recentOrders.map((item) => ({ ...item, key: `${item.orderNumber}-${item.createdAt}` }))}
                pagination={false}
                size="small"
                columns={[
                  { title: 'Mã đơn', dataIndex: 'orderNumber', key: 'orderNumber' },
                  { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
                  {
                    title: 'Tổng tiền',
                    dataIndex: 'totalAmount',
                    key: 'totalAmount',
                    render: (value: number) => formatCurrency(value)
                  },
                  {
                    title: 'Trạng thái',
                    dataIndex: 'status',
                    key: 'status',
                    render: (value: string) => <OrderStatusBadge status={value} />
                  },
                  {
                    title: 'Tạo lúc',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    render: (value: string) => dayjs(value).format('DD/MM HH:mm')
                  }
                ]}
                locale={{ emptyText: 'Chưa có đơn hàng gần đây' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  )
}

const Reports = () => {
  const { user } = useAuth()

  if (user?.role === 'staff') {
    return <StaffReports />
  }

  return <ManagementReports />
}

export default Reports
