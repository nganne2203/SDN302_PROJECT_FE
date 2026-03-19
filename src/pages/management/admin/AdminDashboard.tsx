import { Card, Row, Col, Statistic, Table, Tag, Select, Spin, Alert, Button } from 'antd'
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  PercentageOutlined,
  AlertOutlined,
  TruckOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import useDashboard from '@/hooks/useDashboard'
import useBranchPerformance from '@/hooks/useBranchPerformance'
import type { RecentOrder, BranchPerformanceItem } from '@/features/dashboard/dashboardTypes'
import { ROUTES } from '@/constants/constant'
import dayjs from 'dayjs'
import OrderStatusBadge from '@/components/order/OrderStatusBadge'

const PERIOD_OPTIONS = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Hôm qua', value: 'yesterday' },
  { label: 'Tuần này', value: 'this_week' },
  { label: 'Tuần trước', value: 'last_week' },
  { label: 'Tháng này', value: 'this_month' },
  { label: 'Tháng trước', value: 'last_month' },
  { label: 'Năm nay', value: 'this_year' }
]

const formatCurrency = (value: number) => value.toLocaleString('vi-VN') + ' ₫'

const statCardStyles = {
  body: {
    minHeight: 160,
    padding: 20,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between'
  }
}

const cardClassName =
  'rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data, loading, error, filter, handleFilterChange, refresh } = useDashboard('this_month')
  const {
    data: branchPerfData,
    loading: branchPerfLoading,
    filter: branchPerfFilter,
    handleFilterChange: handleBranchPerfFilterChange
  } = useBranchPerformance('this_month', 10)

  const overview = data?.overview
  const orders = data?.orders
  const products = data?.products
  const customers = data?.customers
  const performance = data?.performance
  const recentOrders = data?.recentOrders ?? []

  const recentOrderColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (v: string) => <span className="font-mono text-xs">{v}</span>
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: unknown, record: RecentOrder) =>
        record.customer ?? '—'
    },
    {
      title: 'Chi nhánh',
      key: 'branch',
      render: (_: unknown, record: RecentOrder) => record.branch ?? '—'
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => formatCurrency(v)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <OrderStatusBadge status={status} />
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm')
    }
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Quản Trị Hệ Thống</h1>
          <p className="text-gray-500">
            Xin chào, {user?.fullname}! Đây là bảng điều khiển toàn hệ thống chuỗi cửa hàng.
          </p>
          {data?.dateRange && (
            <p className="text-xs text-gray-400 mt-1">
              {dayjs(data.dateRange.startDate).format('DD/MM/YYYY')} —{' '}
              {dayjs(data.dateRange.endDate).format('DD/MM/YYYY')}
            </p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <Select
            value={filter.period}
            options={PERIOD_OPTIONS}
            onChange={(val) => handleFilterChange({ period: val })}
            style={{ width: 160 }}
          />
          <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
            Làm mới
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert message={error} type="error" showIcon closable className="mb-6" />
      )}

      <Spin spinning={loading}>
        <div className="space-y-6">
          <section className="rounded-2xl bg-slate-50/80 p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Tổng quan</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card styles={statCardStyles} className={cardClassName}>
                <Statistic
                  title="Tổng doanh thu"
                  value={overview?.totalRevenue ?? 0}
                  prefix={<DollarOutlined className="text-green-600" />}
                  styles={{ content: { color: '#52c41a' } }}
                  valueStyle={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15 }}
                  formatter={(v) => formatCurrency(Number(v))}
                />
              </Card>

              <Card styles={statCardStyles} className={cardClassName}>
                <Statistic
                  title="Tổng đơn hàng"
                  value={overview?.totalOrders ?? 0}
                  prefix={<ShoppingCartOutlined className="text-blue-600" />}
                  styles={{ content: { color: '#1890ff' } }}
                  valueStyle={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15 }}
                />
              </Card>

              <Card styles={statCardStyles} className={cardClassName}>
                <Statistic
                  title="Sản phẩm đã bán"
                  value={overview?.totalProductsSold ?? products?.totalSold ?? 0}
                  prefix={<ShoppingOutlined className="text-orange-600" />}
                  styles={{ content: { color: '#fa8c16' } }}
                  valueStyle={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15 }}
                />
                <p className="text-xs text-orange-600 mt-2">
                  {products?.totalActive ?? 0} sản phẩm đang bán
                </p>
              </Card>

              <Card styles={statCardStyles} className={cardClassName}>
                <Statistic
                  title="Khách hàng mới"
                  value={customers?.newCustomers ?? 0}
                  prefix={<UserOutlined className="text-purple-600" />}
                  styles={{ content: { color: '#722ed1' } }}
                  valueStyle={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15 }}
                />
              </Card>
            </div>
          </section>

          <section className="rounded-2xl bg-slate-50/80 p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Tình trạng đơn hàng</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card styles={statCardStyles} className={cardClassName}>
                <Statistic
                  title="Đơn đã giao"
                  value={orders?.delivered ?? 0}
                  prefix={<CheckCircleOutlined className="text-green-600" />}
                  styles={{ content: { color: '#52c41a' } }}
                />
              </Card>

              <Card styles={statCardStyles} className={cardClassName}>
                <Statistic
                  title="Đã xác nhận"
                  value={orders?.confirmed ?? 0}
                  prefix={<FileTextOutlined className="text-blue-500" />}
                  styles={{ content: { color: '#096dd9' } }}
                />
              </Card>

              <Card styles={statCardStyles} className={cardClassName}>
                <Statistic
                  title="Đang giao"
                  value={orders?.shipped ?? 0}
                  prefix={<TruckOutlined className="text-cyan-600" />}
                  styles={{ content: { color: '#08979c' } }}
                />
              </Card>

              <Card styles={statCardStyles} className={cardClassName}>
                <Statistic
                  title="Đã hủy"
                  value={orders?.cancelled ?? 0}
                  prefix={<StopOutlined className="text-red-400" />}
                  styles={{ content: { color: '#ff4d4f' } }}
                />
              </Card>
            </div>
          </section>

          <section className="rounded-2xl bg-slate-50/80 p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Chỉ số phụ</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card styles={statCardStyles} className={cardClassName}>
                <Statistic
                  title="Doanh thu TB / đơn"
                  value={overview?.averageOrderValue ?? 0}
                  prefix={<DollarOutlined className="text-teal-600" />}
                  styles={{ content: { color: '#13c2c2' } }}
                  formatter={(v) => formatCurrency(Number(v))}
                />
              </Card>

              <Card styles={statCardStyles} className={cardClassName}>
                <Statistic
                  title="Tỷ lệ hoàn thành"
                  value={performance?.completionRate ?? 0}
                  prefix={<PercentageOutlined className="text-green-600" />}
                  styles={{ content: { color: '#3f8600' } }}
                  suffix="%"
                  precision={1}
                />
              </Card>

              <Card styles={statCardStyles} className={cardClassName}>
                <Statistic
                  title="Sản phẩm sắp hết"
                  value={products?.lowStock ?? 0}
                  prefix={<AlertOutlined className="text-red-600" />}
                  styles={{ content: { color: '#cf1322' } }}
                />
                <p className="text-xs text-red-500 mt-2">Cần nhập thêm hàng</p>
              </Card>

              <Card styles={statCardStyles} className={cardClassName}>
                <Statistic
                  title="Sản phẩm đang bán"
                  value={products?.totalActive ?? 0}
                  prefix={<ShoppingOutlined className="text-orange-500" />}
                  styles={{ content: { color: '#fa8c16' } }}
                />
              </Card>
            </div>
          </section>
        </div>

        <div className="mt-4 space-y-4">
          {/* Branch Performance Table */}
          <Card
            title="Hiệu suất chi nhánh"
            extra={
              <Select
                value={branchPerfFilter.period}
                options={PERIOD_OPTIONS}
                onChange={(val) => handleBranchPerfFilterChange({ period: val })}
                style={{ width: 140 }}
                size="small"
              />
            }
          >
            <Spin spinning={branchPerfLoading}>
              <Table<BranchPerformanceItem>
                columns={[
                  {
                    title: 'Chi nhánh',
                    dataIndex: 'branchName',
                    key: 'branchName'
                  },
                  {
                    title: 'Doanh thu',
                    dataIndex: 'revenue',
                    key: 'revenue',
                    render: (v: number) => formatCurrency(v),
                    sorter: (a, b) => a.revenue - b.revenue,
                    defaultSortOrder: 'descend'
                  },
                  {
                    title: 'Đơn hàng',
                    dataIndex: 'orders',
                    key: 'orders',
                    sorter: (a, b) => a.orders - b.orders
                  },
                  {
                    title: 'Số lượng bán',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    sorter: (a, b) => a.quantity - b.quantity
                  },
                  {
                    title: 'Quản lý',
                    dataIndex: 'manager',
                    key: 'manager'
                  },
                  {
                    title: 'Trạng thái',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status: string) => (
                      <Tag color={status === 'Hoạt động' ? 'success' : 'error'}>
                        {status === 'Hoạt động' ? 'Hoạt động' : 'Tạm dừng'}
                      </Tag>
                    )
                  }
                ]}
                dataSource={(branchPerfData?.branches ?? []).map((b) => ({ ...b, key: b.branchId }))}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                size="small"
                summary={() =>
                  branchPerfData?.summary ? (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong>Tổng ({branchPerfData.summary.totalBranches} chi nhánh)</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{formatCurrency(branchPerfData.summary.totalRevenue)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <strong>{branchPerfData.summary.totalOrders}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        <strong>{branchPerfData.summary.totalQuantity}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} />
                      <Table.Summary.Cell index={5} />
                    </Table.Summary.Row>
                  ) : null
                }
                locale={{ emptyText: branchPerfLoading ? 'Đang tải...' : 'Không có dữ liệu' }}
              />
            </Spin>
          </Card>

          {/* Recent Orders Table */}
          <div className="pt-4">
            <Card title="Đơn hàng gần đây">
              <Table
                columns={recentOrderColumns}
                dataSource={recentOrders.map((o) => ({ ...o, key: o._id ?? o.orderNumber }))}
                pagination={false}
                size="small"
                locale={{ emptyText: loading ? 'Đang tải...' : 'Không có dữ liệu' }}
              />
            </Card>
          </div>

          {/* Quick navigation */}
          <div className="">
            <Card title="Quản lý nhanh">
              <Row gutter={[16, 16]}>
                {[
                  { label: 'Đơn hàng', path: ROUTES.MANAGEMENT.ORDERS, icon: <ShoppingCartOutlined /> },
                  { label: 'Sản phẩm', path: ROUTES.MANAGEMENT.PRODUCTS, icon: <ShoppingOutlined /> },
                  { label: 'Người dùng', path: ROUTES.MANAGEMENT.USERS, icon: <UserOutlined /> },
                  { label: 'Chi nhánh', path: ROUTES.MANAGEMENT.BRANCHES, icon: <FileTextOutlined /> },
                  { label: 'Danh mục', path: ROUTES.MANAGEMENT.CATEGORIES, icon: <FileTextOutlined /> },
                  { label: 'Nhập kho', path: ROUTES.MANAGEMENT.STOCK_REQUESTS, icon: <TruckOutlined /> }
                ].map(({ label, path, icon }) => (
                  <Col xs={12} sm={8} lg={4} key={path}>
                    <Button
                      block
                      icon={icon}
                      onClick={() => navigate(path)}
                    >
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

export default AdminDashboard
