import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, Row, Col, Statistic, Select, Button, Tabs, Space, Spin, Empty } from 'antd'
import {
  DollarOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  BarChartOutlined,
  DownloadOutlined
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
import useAuth from '@/hooks/useAuth'
import dashboardApi from '@/apis/dashboard'
import branchApi from '@/apis/branch'
import type {
  RevenueData,
  PaymentStatisticsData,
  OrderStatusSummaryData
} from '@/features/dashboard/dashboardTypes'
import type { Branch } from '@/types/api'
import { formatCurrency } from '@/utils/formatCurrency'

const colors = ['#1890ff', '#13c2c2', '#722ed1', '#faad14', '#eb2f96', '#52c41a']

const Reports = () => {
  const { user } = useAuth()
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'this_year'>('this_month')
  const [branchId, setBranchId] = useState<string>('')
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [paymentStats, setPaymentStats] = useState<PaymentStatisticsData | null>(null)
  const [orderStatus, setOrderStatus] = useState<OrderStatusSummaryData | null>(null)

  const isAdmin = user?.role === 'admin'

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchApi.getAllBranches({ isActive: true })
      setBranches(response.data || [])
    } catch {
      setBranches([])
    }
  }, [])

  const loadReports = useCallback(async () => {
    setIsLoading(true)
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
      setRevenue(null)
      setPaymentStats(null)
      setOrderStatus(null)
    } finally {
      setIsLoading(false)
    }
  }, [branchId, period])

  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const revenueChartData = useMemo(() => revenue?.data || [], [revenue])
  const paymentMethodData = useMemo(
    () => (Array.isArray(paymentStats?.byMethod) ? paymentStats?.byMethod : []),
    [paymentStats]
  )
  const paymentStatusData = useMemo(
    () => (Array.isArray(paymentStats?.byStatus) ? paymentStats?.byStatus : []),
    [paymentStats]
  )
  const orderStatusData = useMemo(
    () => (Array.isArray(orderStatus?.statuses) ? orderStatus?.statuses : []),
    [orderStatus]
  )

  const summaryCards = [
    {
      title: 'Tổng doanh thu',
      value: revenue?.summary?.totalRevenue || 0,
      prefix: <DollarOutlined className="text-green-600" />,
      suffix: '₫'
    },
    {
      title: 'Tổng đơn hàng',
      value: revenue?.summary?.totalOrders || 0,
      prefix: <ShoppingCartOutlined className="text-blue-600" />
    },
    {
      title: 'Giá trị đơn TB',
      value: revenue?.summary?.averageOrderValue || 0,
      prefix: <PercentageOutlined className="text-purple-600" />,
      suffix: '₫'
    },
    {
      title: 'Tổng trạng thái đơn',
      value: orderStatusData.reduce((acc: number, cur: { count?: number }) => acc + (cur?.count || 0), 0),
      prefix: <BarChartOutlined className="text-orange-600" />
    }
  ]

  const paymentMethodTotal = paymentMethodData.reduce(
    (sum: number, item: { count?: number }) => sum + (item?.count || 0),
    0
  )
  const paymentStatusTotal = paymentStatusData.reduce(
    (sum: number, item: { count?: number }) => sum + (item?.count || 0),
    0
  )

  const renderEmpty = (description: string) => (
    <div className="py-8">
      <Empty description={description} />
    </div>
  )

  return (
    <Spin spinning={isLoading}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Báo cáo & Thống kê</h1>
            <p className="text-gray-500">Theo dõi doanh thu, thanh toán và trạng thái đơn hàng</p>
          </div>
          <Space>
            <Select
              value={period}
              onChange={(value) => setPeriod(value)}
              style={{ width: 180 }}
              options={[
                { label: 'Tháng này', value: 'this_month' },
                { label: 'Tháng trước', value: 'last_month' },
                { label: 'Năm nay', value: 'this_year' }
              ]}
            />
            {isAdmin && (
              <Select
                value={branchId}
                onChange={setBranchId}
                style={{ width: 220 }}
                placeholder="Tất cả chi nhánh"
                allowClear
                options={branches.map((b) => ({ label: `${b.name} - ${b.address}`, value: b._id }))}
              />
            )}
            <Button type="primary" icon={<DownloadOutlined />} disabled>
              Xuất báo cáo (sắp có)
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          {summaryCards.map((card) => (
            <Col xs={24} sm={12} lg={6} key={card.title}>
              <Card hoverable>
                <Statistic
                  title={card.title}
                  value={card.value}
                  prefix={card.prefix}
                  suffix={card.suffix}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Tabs
          defaultActiveKey="revenue"
          items={[
            {
              key: 'revenue',
              label: '📈 Doanh thu',
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
              label: '💳 Thanh toán',
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
                                data={paymentMethodData as Array<{ method?: string; name?: string; count?: number }>}
                                dataKey="count"
                                nameKey={(entry) => entry.method || entry.name || 'Khác'}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                labelLine={false}
                              >
                                {(paymentMethodData as Array<unknown>).map((_, index: number) => (
                                  <Cell key={index} fill={colors[index % colors.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                        <div className="mt-4 text-sm text-gray-500">Tổng giao dịch: {paymentMethodTotal}</div>
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
                                data={paymentStatusData as Array<{ status?: string; count?: number }>}
                                dataKey="count"
                                nameKey={(entry) => entry.status || 'Khác'}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                labelLine={false}
                              >
                                {(paymentStatusData as Array<unknown>).map((_, index: number) => (
                                  <Cell key={index} fill={colors[index % colors.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                        <div className="mt-4 text-sm text-gray-500">Tổng giao dịch: {paymentStatusTotal}</div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: 'orders',
              label: '🧾 Trạng thái đơn hàng',
              children: (
                <Card>
                  <div style={{ height: 360 }}>
                    {orderStatusData.length === 0 ? (
                      renderEmpty('Chưa có dữ liệu trạng thái đơn hàng')
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={orderStatusData as Array<{ status: string; count: number; percentage?: number }> }>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <Tooltip />
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

export default Reports
