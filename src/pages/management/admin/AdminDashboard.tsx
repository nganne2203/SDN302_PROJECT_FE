import { Card, Row, Col, Statistic, Table, Button, Tag, Alert, Tabs } from 'antd'
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  PercentageOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  TruckOutlined,
  GiftOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // System-wide branch performance data
  const branchPerformance = [
    {
      key: '1',
      branchName: 'Chi nhánh Hà Nội',
      revenue: 45000000,
      orders: 320,
      inventory: 1200,
      manager: 'Nguyễn Văn X',
      status: 'active'
    },
    {
      key: '2',
      branchName: 'Chi nhánh TP. HCM',
      revenue: 52000000,
      orders: 380,
      inventory: 1500,
      manager: 'Trần Thị Y',
      status: 'active'
    },
    {
      key: '3',
      branchName: 'Chi nhánh Đà Nẵng',
      revenue: 28000000,
      orders: 156,
      inventory: 680,
      manager: 'Lê Minh Z',
      status: 'active'
    }
  ]

  // Pending stock requests from all branches
  const pendingStockRequests = [
    {
      key: '1',
      requestId: 'REQ-001',
      branchName: 'Chi nhánh Hà Nội',
      productName: 'iPhone 15 Pro',
      quantity: 50,
      status: 'pending',
      requestDate: '2024-01-30'
    },
    {
      key: '2',
      requestId: 'REQ-002',
      branchName: 'Chi nhánh TP. HCM',
      productName: 'Samsung Galaxy S24',
      quantity: 30,
      status: 'pending',
      requestDate: '2024-01-29'
    }
  ]

  // Pricing quotes (FE-08)
  const pricingQuotes = [
    {
      key: '1',
      quoteId: 'QT-001',
      productName: 'iPhone 15 Pro',
      quantityRange: '1-10',
      discount: 0,
      status: 'active'
    },
    {
      key: '2',
      quoteId: 'QT-002',
      productName: 'iPhone 15 Pro',
      quantityRange: '11-50',
      discount: 5,
      status: 'active'
    },
    {
      key: '3',
      quoteId: 'QT-003',
      productName: 'iPhone 15 Pro',
      quantityRange: '51+',
      discount: 10,
      status: 'active'
    }
  ]

  // Sample data
  const recentOrders = [
    {
      key: '1',
      orderNumber: 'ORD-001',
      customer: 'Nguyễn Văn A',
      branch: 'Chi nhánh Hà Nội',
      total: 2500000,
      status: 'pending',
      date: '2024-01-30'
    },
    {
      key: '2',
      orderNumber: 'ORD-002',
      customer: 'Trần Thị B',
      branch: 'Chi nhánh TP. HCM',
      total: 1800000,
      status: 'completed',
      date: '2024-01-29'
    },
    {
      key: '3',
      orderNumber: 'ORD-003',
      customer: 'Lê Minh C',
      branch: 'Chi nhánh Đà Nẵng',
      total: 3200000,
      status: 'processing',
      date: '2024-01-28'
    }
  ]

  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderNumber',
      key: 'orderNumber'
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer'
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch'
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => `${value.toLocaleString('vi-VN')} ₫`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          pending: 'warning',
          processing: 'processing',
          completed: 'success',
          canceled: 'error'
        }
        const labelMap: Record<string, string> = {
          pending: 'Chờ xử lý',
          processing: 'Đang xử lý',
          completed: 'Hoàn thành',
          canceled: 'Đã hủy'
        }
        return <Tag color={statusMap[status]}>{labelMap[status]}</Tag>
      }
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date'
    }
  ]

  const branchColumns = [
    {
      title: 'Chi nhánh',
      dataIndex: 'branchName',
      key: 'branchName'
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => `${value.toLocaleString('vi-VN')} ₫`
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'orders',
      key: 'orders'
    },
    {
      title: 'Tồn kho',
      dataIndex: 'inventory',
      key: 'inventory'
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
      render: (status: string) => <Tag color={status === 'active' ? 'success' : 'error'}>{status === 'active' ? 'Hoạt động' : 'Tạm dừng'}</Tag>
    }
  ]

  const stockRequestColumns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'requestId',
      key: 'requestId'
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branchName',
      key: 'branchName'
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value: number) => `${value} cái`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'pending' ? 'warning' : 'success'}>
          {status === 'pending' ? 'Chờ duyệt' : 'Đã duyệt'}
        </Tag>
      )
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      key: 'requestDate'
    }
  ]

  const priceQuoteColumns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'quoteId',
      key: 'quoteId'
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: 'Khoảng số lượng',
      dataIndex: 'quantityRange',
      key: 'quantityRange'
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount',
      key: 'discount',
      render: (value: number) => `${value}%`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      )
    }
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Quản Trị Hệ Thống</h1>
        <p className="text-gray-500">
          Xin chào, {user?.fullname}! Đây là bảng điều khiển toàn hệ thống chuỗi cửa hàng.
        </p>
      </div>

      {/* Alert for pending requests */}
      {pendingStockRequests.length > 0 && (
        <Alert
          message={`⏳ ${pendingStockRequests.length} yêu cầu nhập kho chờ duyệt`}
          description="Vui lòng kiểm tra và phê duyệt yêu cầu nhập kho từ các chi nhánh"
          type="info"
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
              title="Tổng doanh thu"
              value={125800000}
              prefix={<DollarOutlined className="text-green-600" />}
              valueStyle={{ color: '#52c41a' }}
              suffix="₫"
            />
            <p className="text-xs text-green-600 mt-2">
              <ArrowUpOutlined /> 12% so với tháng trước
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tổng đơn hàng"
              value={856}
              prefix={<ShoppingCartOutlined className="text-blue-600" />}
              valueStyle={{ color: '#1890ff' }}
            />
            <p className="text-xs text-blue-600 mt-2">
              <ArrowUpOutlined /> 8% so với tháng trước
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tổng sản phẩm"
              value={2450}
              prefix={<ShoppingOutlined className="text-orange-600" />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <p className="text-xs text-orange-600 mt-2">
              <ArrowUpOutlined /> 15 sản phẩm mới
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tổng người dùng"
              value={3240}
              prefix={<UserOutlined className="text-purple-600" />}
              valueStyle={{ color: '#722ed1' }}
            />
            <p className="text-xs text-purple-600 mt-2">
              <ArrowUpOutlined /> 45 người dùng mới
            </p>
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Đơn hàng chờ xử lý"
              value={23}
              prefix={<ClockCircleOutlined className="text-yellow-600" />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Chi nhánh hoạt động"
              value={8}
              prefix={<ShoppingOutlined className="text-cyan-600" />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Yêu cầu nhập kho"
              value={pendingStockRequests.length}
              prefix={<AlertOutlined className="text-red-600" />}
              valueStyle={{ color: '#cf1322' }}
            />
            <p className="text-xs text-red-600 mt-2">Chờ duyệt</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tỷ lệ hoàn thành"
              value={97.5}
              prefix={<PercentageOutlined className="text-green-600" />}
              valueStyle={{ color: '#3f8600' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Branch Performance Overview */}
      <Card className="mt-6" title="📊 Hiệu suất chi nhánh (FE-11)">
        <Table
          columns={branchColumns}
          dataSource={branchPerformance}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* Tabs for different management sections */}
      <Card className="mt-6">
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: '📦 Yêu cầu nhập kho (FE-10)',
              children: (
                <div>
                  <Table
                    columns={stockRequestColumns}
                    dataSource={pendingStockRequests}
                    pagination={{ pageSize: 5 }}
                    size="small"
                  />
                  <Button
                    type="primary"
                    className="mt-4"
                    onClick={() => navigate('/management/stock-requests')}
                  >
                    Quản lý toàn bộ yêu cầu
                  </Button>
                </div>
              )
            },
            {
              key: '2',
              label: '💰 Quản lý phiếu báo giá (FE-08)',
              children: (
                <div>
                  <Table
                    columns={priceQuoteColumns}
                    dataSource={pricingQuotes}
                    pagination={{ pageSize: 5 }}
                    size="small"
                  />
                  <Button
                    type="primary"
                    className="mt-4"
                    onClick={() => navigate('/management/pricing-quotes')}
                  >
                    Quản lý toàn bộ phiếu báo giá
                  </Button>
                </div>
              )
            },
            {
              key: '3',
              label: '📋 Đơn hàng gần đây',
              children: (
                <Table
                  columns={orderColumns}
                  dataSource={recentOrders}
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              )
            }
          ]}
        />
      </Card>

      {/* Quick Actions */}
      <Card className="mt-6" title="🚀 Quản lý nhanh">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="primary"
              block
              onClick={() => navigate('/management/orders')}
              icon={<ShoppingCartOutlined />}
            >
              Đơn hàng
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="default"
              block
              onClick={() => navigate('/management/products')}
              icon={<ShoppingOutlined />}
            >
              Sản phẩm
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="default"
              block
              onClick={() => navigate('/management/users')}
              icon={<UserOutlined />}
            >
              Người dùng
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="default"
              block
              onClick={() => navigate('/management/branches')}
              icon={<ShoppingOutlined />}
            >
              Chi nhánh
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="default"
              block
              onClick={() => navigate('/management/categories')}
              icon={<FileTextOutlined />}
            >
              Danh mục
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="dashed"
              block
              onClick={() => navigate('/management/stock-requests')}
              icon={<TruckOutlined />}
            >
              Nhập kho
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="dashed"
              block
              onClick={() => navigate('/management/pricing-quotes')}
              icon={<GiftOutlined />}
            >
              Báo giá
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="dashed"
              block
              onClick={() => navigate('/management/reports')}
              icon={<FileTextOutlined />}
            >
              Báo cáo
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="dashed"
              block
              onClick={() => navigate('/management/inventory')}
              icon={<ShoppingOutlined />}
            >
              Tồn kho
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default AdminDashboard
