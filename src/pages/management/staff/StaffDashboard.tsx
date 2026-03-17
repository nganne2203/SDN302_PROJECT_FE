import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Col, Empty, Progress, Row, Select, Spin, Statistic, Table, Tag } from 'antd'
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  InboxOutlined,
  ShopOutlined,
  CustomerServiceOutlined,
  UserOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import dashboardApi from '@/apis/dashboard'
import useAuth from '@/hooks/useAuth'
import { ROUTES } from '@/constants/constant'
import { formatCurrency } from '@/utils/formatCurrency'
import type { DashboardData, OrderStatusSummaryData } from '@/features/dashboard/dashboardTypes'
import OrderStatusBadge from '@/components/order/OrderStatusBadge'

const PERIOD_OPTIONS = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Tuần này', value: 'this_week' },
  { label: 'Tháng này', value: 'this_month' },
  { label: 'Tháng trước', value: 'last_month' }
] as const

type StaffPeriod = (typeof PERIOD_OPTIONS)[number]['value']

const STATUS_COLOR: Record<string, string> = {
  pending: 'warning',
  confirmed: 'processing',
  shipped: 'blue',
  delivered: 'success',
  cancelled: 'error'
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy'
}

const STATUS_PROGRESS_COLOR: Record<string, string> = {
  pending: '#faad14',
  confirmed: '#1677ff',
  shipped: '#13c2c2',
  delivered: '#52c41a',
  cancelled: '#ff4d4f'
}

const StaffDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [period, setPeriod] = useState<StaffPeriod>('this_month')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [orderStatusSummary, setOrderStatusSummary] = useState<OrderStatusSummaryData | null>(null)
  const [recentOrders, setRecentOrders] = useState<Array<{
    orderNumber: string
    customer: string
    status: string
    totalAmount: number
    paymentMethod: string
    branch: string
    createdAt: string
  }>>([])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const baseRequests = [
        dashboardApi.getDashboard({ period }),
        dashboardApi.getOrderStatusSummary({ period }),
        dashboardApi.getRecentOrders({ period, limit: 5, page: 1 })
      ] as const

      const [dashboardRes, orderStatusRes, recentOrdersRes] = await Promise.all(baseRequests)

      setDashboard(dashboardRes.data)
      setOrderStatusSummary(orderStatusRes.data)
      setRecentOrders(recentOrdersRes.data as typeof recentOrders)
    } catch {
      setError('Không thể tải dữ liệu dashboard cho nhân viên')
      setDashboard(null)
      setOrderStatusSummary(null)
      setRecentOrders([])
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadDashboard().catch(() => undefined)
  }, [loadDashboard])

  const statusItems = useMemo(
    () => orderStatusSummary?.statuses ?? [],
    [orderStatusSummary]
  )

  const summaryCards = [
    {
      title: 'Đơn hàng trong kỳ',
      value: dashboard?.overview.totalOrders ?? 0,
      prefix: <ShoppingCartOutlined className="text-blue-600" />,
      color: '#1890ff'
    },
    {
      title: 'Doanh thu',
      value: dashboard?.overview.totalRevenue ?? 0,
      prefix: <CheckCircleOutlined className="text-green-600" />,
      color: '#52c41a',
      formatter: (value: string | number) => formatCurrency(Number(value))
    },
    {
      title: 'Sản phẩm đã bán',
      value: dashboard?.overview.totalProductsSold ?? 0,
      prefix: <ShopOutlined className="text-orange-600" />,
      color: '#fa8c16'
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: dashboard?.performance.completionRate ?? 0,
      suffix: '%',
      prefix: <CheckCircleOutlined className="text-green-600" />,
      color: '#3f8600'
    }
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Nhân viên</h1>
          <p className="text-gray-500">
            Xin chào, {user?.fullname}! Đây là tổng quan đơn hàng của chi nhánh bạn.
          </p>
          {dashboard?.dateRange && (
            <p className="text-xs text-gray-400 mt-1">
              {dayjs(dashboard.dateRange.startDate).format('DD/MM/YYYY')} - {dayjs(dashboard.dateRange.endDate).format('DD/MM/YYYY')}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Select
            value={period}
            style={{ width: 160 }}
            options={PERIOD_OPTIONS as unknown as Array<{ label: string; value: string }>}
            onChange={(value) => setPeriod(value as StaffPeriod)}
          />
          <Button icon={<ReloadOutlined />} onClick={() => loadDashboard()} loading={loading}>
            Làm mới
          </Button>
        </div>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          className="mb-6"
        />
      )}

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {summaryCards.map((card) => (
            <Col xs={24} sm={12} lg={6} key={card.title}>
              <Card hoverable className="h-full">
                <Statistic
                  title={card.title}
                  value={card.value}
                  suffix={card.suffix}
                  prefix={card.prefix}
                  formatter={card.formatter}
                  styles={{ content: { color: card.color } }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <div className="mt-4 space-y-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={24}>
              <Card
                title="Trạng thái đơn hàng"
                extra={<span className="text-xs text-gray-500">Tổng: {statusItems.reduce((acc, item) => acc + item.count, 0)} đơn</span>}
              >
                {statusItems.length === 0 ? (
                  <Empty description="Chưa có dữ liệu trạng thái đơn hàng" />
                ) : (
                  <Row gutter={[12, 12]}>
                    {statusItems.map((item) => (
                      <Col xs={24} md={12} key={item.status}>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Tag color={STATUS_COLOR[item.status] || 'default'}>
                                {STATUS_LABEL[item.status] || item.status}
                              </Tag>
                              <p className="mt-2 text-xs text-gray-500">
                                Doanh thu: {formatCurrency(item.totalAmount)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-semibold text-gray-900">{item.count}</div>
                              <div className="text-xs text-gray-500">đơn</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Progress
                              percent={Math.max(0, Math.min(100, item.percentage))}
                              strokeColor={STATUS_PROGRESS_COLOR[item.status] || '#1677ff'}
                              strokeWidth={8}
                              showInfo
                              format={(percent) => `${percent ?? 0}%`}
                            />
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            </Col>
          </Row>

          <Card title="Đơn hàng gần đây" className='mb-6'>
            <Table
              dataSource={recentOrders.map((order) => ({ ...order, key: order.orderNumber }))}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Mã đơn',
                  dataIndex: 'orderNumber',
                  key: 'orderNumber'
                },
                {
                  title: 'Khách hàng',
                  dataIndex: 'customer',
                  key: 'customer'
                },
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
                  render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm')
                }
              ]}
              locale={{ emptyText: 'Chưa có đơn hàng gần đây' }}
            />
          </Card>

          <div className="pt-4">
            <Card title="Quản lý nhanh">
              <Row gutter={[16, 16]}>
                {[
                  { label: 'Đơn hàng', path: ROUTES.MANAGEMENT.ORDERS, icon: <ShoppingCartOutlined /> },
                  { label: 'Kho chi nhánh', path: ROUTES.MANAGEMENT.BRANCH_INVENTORY, icon: <InboxOutlined /> },
                  { label: 'Sản phẩm', path: ROUTES.MANAGEMENT.PRODUCTS, icon: <ShopOutlined /> },
                  { label: 'Dịch vụ', path: ROUTES.MANAGEMENT.SERVICES, icon: <CustomerServiceOutlined /> },
                  { label: 'Khách hàng', path: ROUTES.MANAGEMENT.STAFF_CUSTOMERS, icon: <UserOutlined /> },
                  { label: 'Báo cáo', path: ROUTES.MANAGEMENT.BRANCH_REPORTS, icon: <BarChartOutlined /> }
                ].map(({ label, path, icon }) => (
                  <Col xs={12} sm={8} lg={4} key={path}>
                    <Button block icon={icon} onClick={() => navigate(path)}>
                      {label}
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default StaffDashboard
