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
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import useManagerOrders from '@/hooks/useManagerOrders'
import useManagerStockRequests from '@/hooks/useManagerStockRequests'
import useManagerLowStock from '@/hooks/useManagerLowStock'
import type { StockRequestRecord, StoreInventoryRecord } from '@/types/api'
import { ROUTES } from '@/constants/constant'
import dayjs from 'dayjs'

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending: 'warning',
  confirmed: 'processing',
  shipped: 'blue',
  delivered: 'success',
  cancelled: 'error'
}
const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipped: 'Đang vận chuyển',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy'
}
const STOCK_STATUS_COLOR: Record<string, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error'
}
const STOCK_STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối'
}
const formatCurrency = (v: number) => v.toLocaleString('vi-VN') + ' ₫'

const ManagerDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const branchId = user?.branch ?? null

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

  const {
    data: ordersData,
    loading: ordersLoading,
    error: ordersError
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

  const orders = ordersData?.data ?? []
  const totalOrders = ordersData?.pagination?.totalItems ?? 0
  const stockRequests = stockRequestsData?.data ?? []
  const pendingStockCount = stockRequests.filter(r => r.status === 'pending').length
  const lowStockItems = lowStockData?.data ?? []

  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (v: string) => <span className="font-mono text-xs">{v}</span>
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: unknown, record: Record<string, unknown>) => {
        const customer = record.customer as { fullname?: string; email?: string } | undefined
        return customer?.fullname ?? customer?.email ?? '—'
      }
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => formatCurrency(v)
    },
    {
      title: 'Trạng thái đơn',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={ORDER_STATUS_COLOR[status] ?? 'default'}>
          {ORDER_STATUS_LABEL[status] ?? status}
        </Tag>
      )
    },
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY')
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
          message={`⚠️ Cảnh báo: ${lowStockItems.length} sản phẩm sắp hết hàng`}
          description="Vui lòng tạo yêu cầu nhập kho từ kho tổng"
          type="warning"
          showIcon
          closable
          className="mb-6"
        />
      )}

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tổng đơn hàng"
              value={totalOrders}
              prefix={<ShoppingCartOutlined className="text-blue-600" />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Đơn chờ xử lý"
              value={orders.filter(o => (o as unknown as { status: string }).status === 'pending').length}
              prefix={<ClockCircleOutlined className="text-yellow-600" />}
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
            <p className="text-xs text-red-500 mt-2">Cần nhập thêm hàng</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Yêu cầu nhập kho"
              value={pendingStockCount}
              prefix={<TruckOutlined className="text-orange-600" />}
              styles={{ content: { color: '#fa8c16' } }}
            />
            <p className="text-xs text-orange-500 mt-2">Chờ duyệt từ Admin</p>
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Đơn đã giao"
              value={orders.filter(o => (o as unknown as { status: string }).status === 'delivered').length}
              prefix={<CheckCircleOutlined className="text-green-600" />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Đơn đang giao"
              value={orders.filter(o => (o as unknown as { status: string }).status === 'shipped').length}
              prefix={<TruckOutlined className="text-cyan-600" />}
              styles={{ content: { color: '#08979c' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Đơn đã hủy"
              value={orders.filter(o => (o as unknown as { status: string }).status === 'cancelled').length}
              prefix={<StopOutlined className="text-red-400" />}
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Đơn đã xác nhận"
              value={orders.filter(o => (o as unknown as { status: string }).status === 'confirmed').length}
              prefix={<DollarOutlined className="text-purple-600" />}
              styles={{ content: { color: '#722ed1' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Low Stock Items */}
      <Card
        className="mt-6"
        title="⚠️ Sản phẩm sắp hết hàng"
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
      <Card className="mt-6" title="📦 Yêu cầu nhập kho">
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
      <Card className="mt-6" title="📋 Đơn hàng gần đây">
        {ordersError && (
          <Alert message={ordersError} type="error" showIcon className="mb-3" />
        )}
        <Spin spinning={ordersLoading}>
          <Table
            columns={orderColumns}
            dataSource={orders.map((o, i) => ({ ...o, key: (o as unknown as { _id?: string })._id ?? i }))}
            pagination={{ pageSize: 5, showSizeChanger: false }}
            size="small"
            locale={{ emptyText: ordersLoading ? 'Đang tải...' : 'Không có dữ liệu' }}
          />
        </Spin>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-6" title="Quản lý nhanh">
        <Row gutter={[16, 16]}>
          {[
            { label: 'Đơn hàng', path: ROUTES.MANAGEMENT.ORDERS, icon: <ShoppingCartOutlined /> },
            { label: 'Tồn kho', path: ROUTES.MANAGEMENT.BRANCH_INVENTORY, icon: <ShoppingOutlined /> },
            { label: 'Nhập kho', path: ROUTES.MANAGEMENT.STOCK_REQUESTS, icon: <TruckOutlined /> },
            { label: 'Báo cáo', path: ROUTES.MANAGEMENT.BRANCH_REPORTS, icon: <FileTextOutlined /> },
            { label: 'Nhân viên', path: ROUTES.MANAGEMENT.STAFF, icon: <TeamOutlined /> },
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
