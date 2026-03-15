import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Col, Empty, Row, Select, Spin, Statistic, Table, Tag } from 'antd'
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  AlertOutlined,
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
import type { DashboardData, InventoryStatisticsData, OrderStatusSummaryData } from '@/features/dashboard/dashboardTypes'

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

const StaffDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [period, setPeriod] = useState<StaffPeriod>('this_month')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [inventoryStats, setInventoryStats] = useState<InventoryStatisticsData | null>(null)
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
      const [dashboardRes, inventoryRes, orderStatusRes, recentOrdersRes] = await Promise.all([
        dashboardApi.getDashboard({ period }),
        dashboardApi.getInventoryStatistics(),
        dashboardApi.getOrderStatusSummary({ period }),
        dashboardApi.getRecentOrders({ period, limit: 5, page: 1 })
      ])

      setDashboard(dashboardRes.data)
      setInventoryStats(inventoryRes.data as InventoryStatisticsData)
      setOrderStatusSummary(orderStatusRes.data)
      setRecentOrders(recentOrdersRes.data as typeof recentOrders)
    } catch {
      setError('Không thể tải dữ liệu dashboard cho nhân viên')
      setDashboard(null)
      setInventoryStats(null)
      setOrderStatusSummary(null)
      setRecentOrders([])
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadDashboard().catch(() => undefined)
  }, [loadDashboard])

  const inventorySummary = useMemo(() => {
    const summary = (inventoryStats?.summary ?? {}) as {
      uniqueProducts?: number
      totalQuantity?: number
      totalValue?: number
    }

    return {
      uniqueProducts: summary.uniqueProducts ?? 0,
      totalQuantity: summary.totalQuantity ?? 0,
      totalValue: summary.totalValue ?? 0
    }
  }, [inventoryStats])

  const lowStockItems = useMemo(
    () => ((inventoryStats?.lowStockItems ?? []) as Array<{ productName?: string; quantity?: number }>),
    [inventoryStats]
  )

  const outOfStockItems = useMemo(
    () => ((inventoryStats?.outOfStockItems ?? []) as Array<{ productName?: string }>),
    [inventoryStats]
  )

  const statusItems = useMemo(
    () => orderStatusSummary?.statuses ?? [],
    [orderStatusSummary]
  )

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Nhân viên</h1>
          <p className="text-gray-500">
            Xin chào, {user?.fullname}! Đây là tổng quan đơn hàng và tồn kho của chi nhánh bạn.
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
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Đơn hàng trong kỳ"
                value={dashboard?.overview.totalOrders ?? 0}
                prefix={<ShoppingCartOutlined className="text-blue-600" />}
                styles={{ content: { color: '#1890ff' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Đơn chờ xử lý"
                value={dashboard?.orders.pending ?? 0}
                prefix={<FileTextOutlined className="text-yellow-600" />}
                styles={{ content: { color: '#faad14' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Sản phẩm sắp hết"
                value={lowStockItems.length}
                prefix={<AlertOutlined className="text-red-600" />}
                styles={{ content: { color: '#cf1322' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Hết hàng"
                value={outOfStockItems.length}
                prefix={<InboxOutlined className="text-gray-500" />}
                styles={{ content: { color: '#595959' } }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Doanh thu hỗ trợ"
                value={dashboard?.overview.totalRevenue ?? 0}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                formatter={(value) => formatCurrency(Number(value))}
                styles={{ content: { color: '#52c41a' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Sản phẩm đã bán"
                value={dashboard?.overview.totalProductsSold ?? 0}
                prefix={<ShopOutlined className="text-orange-600" />}
                styles={{ content: { color: '#fa8c16' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="SKU theo dõi"
                value={inventorySummary.uniqueProducts}
                prefix={<InboxOutlined className="text-cyan-600" />}
                styles={{ content: { color: '#08979c' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Tỷ lệ hoàn thành"
                value={dashboard?.performance.completionRate ?? 0}
                suffix="%"
                prefix={<CheckCircleOutlined className="text-green-600" />}
                styles={{ content: { color: '#3f8600' } }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} lg={12}>
            <Card title="Trạng thái đơn hàng">
              {statusItems.length === 0 ? (
                <Empty description="Chưa có dữ liệu trạng thái đơn hàng" />
              ) : (
                <div className="space-y-3">
                  {statusItems.map((item) => (
                    <div key={item.status} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                      <div>
                        <Tag color={STATUS_COLOR[item.status] || 'default'}>
                          {STATUS_LABEL[item.status] || item.status}
                        </Tag>
                        <p className="text-xs text-gray-500 mt-1">
                          Doanh thu: {formatCurrency(item.totalAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{item.count} đơn</div>
                        <div className="text-xs text-gray-500">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Cảnh báo tồn kho">
              {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
                <Empty description="Không có cảnh báo tồn kho" />
              ) : (
                <div className="space-y-3">
                  {lowStockItems.slice(0, 4).map((item, index) => (
                    <div key={`${item.productName || 'low-stock'}-${index}`} className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3">
                      <div className="font-medium text-gray-900">{item.productName || 'Sản phẩm'}</div>
                      <div className="text-sm text-amber-700">Còn {item.quantity ?? 0}</div>
                    </div>
                  ))}
                  {outOfStockItems.slice(0, 2).map((item, index) => (
                    <div key={`${item.productName || 'out-stock'}-${index}`} className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3">
                      <div className="font-medium text-gray-900">{item.productName || 'Sản phẩm'}</div>
                      <div className="text-sm text-red-700">Hết hàng</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <Card className="mt-6" title="Đơn hàng gần đây">
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
                render: (value: string) => (
                  <Tag color={STATUS_COLOR[value] || 'default'}>
                    {STATUS_LABEL[value] || value}
                  </Tag>
                )
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

        <Card className="mt-6" title="Hành động nhanh">
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
      </Spin>
    </div>
  )
}

export default StaffDashboard
