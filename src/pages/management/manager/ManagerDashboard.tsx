import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Button, Tag, Progress, Space, Alert, Spin } from 'antd'
import {
  ShoppingCartOutlined,
  DollarOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  PercentageOutlined,
  TeamOutlined,
  TruckOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import useManagerOrders from '@/hooks/useManagerOrders'
import useManagerStockRequests from '@/hooks/useManagerStockRequests'
import useManagerLowStock from '@/hooks/useManagerLowStock'
import dashboardApi from '@/apis/dashboard'
import type { DashboardData, RecentOrder } from '@/features/dashboard/dashboardTypes'
import type { StockRequestRecord, StoreInventoryRecord } from '@/types/api'
import { ROUTES } from '@/constants/constant'
import dayjs from 'dayjs'
import OrderStatusBadge from '@/components/order/OrderStatusBadge'

const STOCK_STATUS_COLOR: Record<string, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  partially_approved: 'processing'
}
const STOCK_STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  partially_approved: 'Duyệt một phần'
}
const formatCurrency = (v: number) => v.toLocaleString('vi-VN') + ' ₫'

const ManagerDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const branchId = user?.branch ?? null
  const branchIdParam = typeof branchId === 'string' ? branchId : null

  const [dashboard, setDashboard] = useState<DashboardData | null>(null)

  const [branchName, setBranchName] = useState<string>('—')
  useEffect(() => {
    if (branchId) {
      import('@/apis/branch').then(({ branchApi }) => {
        branchApi.getBranchById(branchId).then(res => {
          setBranchName(res.data?.name ?? '—')
        }).catch(() => setBranchName('—'))
      })
    } else {
      setBranchName('—')
    }
  }, [branchId])

  useEffect(() => {
    if (!branchIdParam) {
      setDashboard(null)
      return
    }

    let isMounted = true

    dashboardApi.getDashboard({ period: 'this_month', branchId: branchIdParam })
      .then((res) => {
        if (!isMounted) return
        setDashboard(res.data)
      })
      .catch(() => {
        if (!isMounted) return
        setDashboard(null)
      })

    return () => {
      isMounted = false
    }
  }, [branchIdParam])

  const {
    data: ordersData
  } = useManagerOrders({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })

  const {
    data: stockRequestsData,
    loading: stockRequestsLoading,
    error: stockRequestsError
  } = useManagerStockRequests(branchId, { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })

  const {
    data: lowStockData,
    loading: lowStockLoading,
    refresh: refreshLowStock
  } = useManagerLowStock(branchId, 5)

  const totalOrders = ordersData?.pagination?.totalItems ?? 0
  const stockRequests = stockRequestsData?.data ?? []
  const pendingStockCount = stockRequests.filter(r => r.status === 'pending').length
  const lowStockItems = lowStockData?.data ?? []
  const recentOrders = dashboard?.recentOrders ?? []
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

  const stockRequestColumns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: '_id',
      key: '_id',
      render: (v: string) => <span className="font-mono text-xs">{v.slice(-8).toUpperCase()}</span>
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: unknown, record: StockRequestRecord) => record.product?.name ?? '—'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (v: number) => `${v} cái`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STOCK_STATUS_COLOR[status] ?? 'default'}>
          {STOCK_STATUS_LABEL[status] ?? status}
        </Tag>
      )
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY')
    }
  ]

  const metricCards = [
    {
      title: 'Tổng đơn hàng',
      value: totalOrders,
      prefix: <ShoppingCartOutlined className="text-blue-600" />,
      color: '#1890ff'
    },
    {
      title: 'Sản phẩm sắp hết',
      value: lowStockItems.length,
      prefix: <AlertOutlined className="text-red-600" />,
      color: '#cf1322',
      subtitle: 'Cần nhập thêm hàng',
      subtitleClassName: 'text-red-500'
    },
    {
      title: 'Yêu cầu nhập kho',
      value: pendingStockCount,
      prefix: <TruckOutlined className="text-orange-600" />,
      color: '#fa8c16',
      subtitle: 'Chờ duyệt từ Admin',
      subtitleClassName: 'text-orange-500'
    },
    {
      title: 'Đơn đã giao',
      value: dashboard?.overview.deliveredOrders ?? 0,
      prefix: <CheckCircleOutlined className="text-green-600" />,
      color: '#52c41a'
    },
    {
      title: 'Đơn đang giao',
      value: dashboard?.overview.shippedOrders ?? 0,
      prefix: <TruckOutlined className="text-cyan-600" />,
      color: '#08979c'
    },
    {
      title: 'Đơn đã hủy',
      value: dashboard?.overview.cancelledOrders ?? 0,
      prefix: <StopOutlined className="text-red-400" />,
      color: '#ff4d4f'
    },
    {
      title: 'Đơn đã xác nhận',
      value: dashboard?.overview.confirmedOrders ?? 0,
      prefix: <DollarOutlined className="text-purple-600" />,
      color: '#722ed1'
    }
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Quản Lý Chi Nhánh</h1>
        <p className="text-gray-500">
          Xin chào, {user?.fullname}! Bạn đang quản lý: <strong>{branchName}</strong>
        </p>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <Alert
          message={`Cảnh báo: ${lowStockItems.length} sản phẩm sắp hết hàng`}
          description="Vui lòng tạo yêu cầu nhập kho từ kho tổng"
          type="warning"
          showIcon
          closable
          className="mb-6"
        />
      )}

      {/* Metrics */}
      <Row gutter={[16, 16]}>
        {metricCards.map((metric) => (
          <Col xs={24} sm={12} lg={6} key={metric.title}>
            <Card hoverable className="h-full">
              <Statistic
                title={metric.title}
                value={metric.value}
                prefix={metric.prefix}
                styles={{ content: { color: metric.color } }}
              />
              <p className={`mt-2 min-h-[20px] text-xs ${metric.subtitleClassName ?? 'text-transparent'}`}>
                {metric.subtitle ?? '.'}
              </p>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Low Stock Items */}
      <Card
        style={{ marginTop: 16 }}
        title="Sản phẩm sắp hết hàng"
        extra={
          <Button size="small" icon={<ReloadOutlined />} onClick={refreshLowStock} loading={lowStockLoading}>
            Làm mới
          </Button>
        }
      >
        <Spin spinning={lowStockLoading}>
          {lowStockItems.length === 0 ? (
            <p className="text-gray-400 text-sm">Không có sản phẩm nào sắp hết hàng</p>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }}>
              {lowStockItems.map((item: StoreInventoryRecord) => {
                const pct = item.minThreshold > 0
                  ? Math.round((item.quantity / item.minThreshold) * 100)
                  : 100
                return (
                  <div key={item._id} style={{ marginBottom: '12px' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>{item.product?.name ?? '—'}</strong>
                      <span style={{ marginLeft: '12px', color: '#cf1322' }}>
                        Hiện có: {item.quantity}/{item.minThreshold}
                      </span>
                    </div>
                    <Progress
                      percent={Math.min(pct, 100)}
                      strokeColor={pct < 50 ? '#cf1322' : '#faad14'}
                      size="small"
                    />
                  </div>
                )
              })}
              <Button
                type="primary"
                onClick={() => navigate(ROUTES.MANAGEMENT.STOCK_REQUESTS)}
              >
                Tạo yêu cầu nhập kho
              </Button>
            </Space>
          )}
        </Spin>
      </Card>

      {/* Stock Requests */}
      <Card style={{ marginTop: 16 }} title="Yêu cầu nhập kho">
        {stockRequestsError && (
          <Alert message={stockRequestsError} type="error" showIcon className="mb-3" />
        )}
        <Spin spinning={stockRequestsLoading}>
          <Table<StockRequestRecord>
            columns={stockRequestColumns}
            dataSource={stockRequests.map(r => ({ ...r, key: r._id }))}
            pagination={{ pageSize: 5, showSizeChanger: false }}
            size="small"
            locale={{ emptyText: stockRequestsLoading ? 'Đang tải...' : 'Không có dữ liệu' }}
          />
        </Spin>
      </Card>

      {/* Recent Orders */}
      <Card style={{ marginTop: 16 }} title="Đơn hàng gần đây">
        <Table
          columns={recentOrderColumns}
          dataSource={recentOrders.map((o) => ({ ...o, key: o._id ?? o.orderNumber }))}
          pagination={false}
          size="small"
          // locale={{ emptyText: loading ? 'Đang tải...' : 'Không có dữ liệu' }}
        />
      </Card>

      {/* Quick Actions */}
      <Card style={{ marginTop: 16, marginBottom: 16 }} title="Quản lý nhanh">
        <Row gutter={[16, 16]}>
          {[
            { label: 'Đơn hàng', path: ROUTES.MANAGEMENT.ORDERS, icon: <ShoppingCartOutlined /> },
            { label: 'Tồn kho', path: ROUTES.MANAGEMENT.BRANCH_INVENTORY, icon: <ShoppingOutlined /> },
            { label: 'Nhập kho', path: ROUTES.MANAGEMENT.STOCK_REQUESTS, icon: <TruckOutlined /> },
            { label: 'Báo cáo', path: ROUTES.MANAGEMENT.BRANCH_REPORTS, icon: <FileTextOutlined /> },
            { label: 'Người dùng', path: ROUTES.MANAGEMENT.MANAGER_USERS, icon: <TeamOutlined /> },
            { label: 'Dịch vụ', path: ROUTES.MANAGEMENT.SERVICES, icon: <PercentageOutlined /> }
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
  )
}

export default ManagerDashboard
