import { Card, Row, Col, Statistic, Table, Button, Tag, Progress, Space, Alert } from 'antd'
import {
  ShoppingCartOutlined,
  DollarOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  PercentageOutlined,
  ArrowUpOutlined,
  TeamOutlined,
  GiftOutlined,
  TruckOutlined,
  AlertOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

const ManagerDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Branch information (mock - would come from context/Redux)
  const branchInfo = {
    id: '1',
    name: 'Chi nhánh Hà Nội',
    location: 'Quận Ba Đình',
    totalInventory: 450,
    lowStockCount: 5
  }

  const recentOrders = [
    {
      key: '1',
      orderNumber: 'ORD-001',
      customer: 'Nguyễn Văn A',
      total: 2500000,
      status: 'pending',
      date: '2024-01-30',
      shipStatus: 'Chờ xác nhận'
    },
    {
      key: '2',
      orderNumber: 'ORD-002',
      customer: 'Trần Thị B',
      total: 1800000,
      status: 'completed',
      date: '2024-01-29',
      shipStatus: 'Đã giao'
    },
    {
      key: '3',
      orderNumber: 'ORD-003',
      customer: 'Lê Minh C',
      total: 3200000,
      status: 'processing',
      date: '2024-01-28',
      shipStatus: 'Đang vận chuyển'
    }
  ]

  // Stock requests awaiting approval (FE-10)
  const pendingStockRequests = [
    {
      key: '1',
      requestId: 'REQ-001',
      productName: 'iPhone 15 Pro',
      quantity: 50,
      status: 'pending',
      requestDate: '2024-01-30'
    },
    {
      key: '2',
      requestId: 'REQ-002',
      productName: 'Samsung Galaxy S24',
      quantity: 30,
      status: 'pending',
      requestDate: '2024-01-29'
    }
  ]

  // Low stock items
  const lowStockItems = [
    { id: '1', name: 'iPhone 15 Pro', current: 5, minimum: 20 },
    { id: '2', name: 'Samsung Galaxy A15', current: 8, minimum: 15 }
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
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => `${value.toLocaleString('vi-VN')} ₫`
    },
    {
      title: 'Trạng thái đơn',
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
      title: 'Trạng thái vận chuyển',
      dataIndex: 'shipStatus',
      key: 'shipStatus'
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date'
    }
  ]

  const stockRequestColumns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'requestId',
      key: 'requestId'
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Quản Lý Chi Nhánh</h1>
        <p className="text-gray-500">
          Xin chào, {user?.fullname}! Bạn đang quản lý: <strong>{branchInfo.name}</strong>
        </p>
      </div>

      {/* Alert for low stock */}
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
              title="Doanh thu chi nhánh"
              value={25800000}
              prefix={<DollarOutlined className="text-green-600" />}
              valueStyle={{ color: '#52c41a' }}
              suffix="₫"
            />
            <p className="text-xs text-green-600 mt-2">
              <ArrowUpOutlined /> 10% so với tháng trước
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Đơn hàng chi nhánh"
              value={156}
              prefix={<ShoppingCartOutlined className="text-blue-600" />}
              valueStyle={{ color: '#1890ff' }}
            />
            <p className="text-xs text-blue-600 mt-2">
              <ArrowUpOutlined /> 5% so với tháng trước
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tồn kho chi nhánh"
              value={450}
              prefix={<ShoppingOutlined className="text-orange-600" />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <p className="text-xs text-orange-600 mt-2">
              {lowStockItems.length} sản phẩm sắp hết
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Nhân viên"
              value={12}
              prefix={<TeamOutlined className="text-purple-600" />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Đơn hàng chờ xử lý"
              value={8}
              prefix={<ClockCircleOutlined className="text-yellow-600" />}
              valueStyle={{ color: '#faad14' }}
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
            <p className="text-xs text-red-600 mt-2">Chờ duyệt từ Admin</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Sản phẩm bán chạy"
              value={45}
              prefix={<ShoppingOutlined className="text-cyan-600" />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tỷ lệ hoàn thành"
              value={96.8}
              prefix={<PercentageOutlined className="text-green-600" />}
              valueStyle={{ color: '#3f8600' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Low Stock Items Alert */}
      {lowStockItems.length > 0 && (
        <Card className="mt-6" title="⚠️ Sản phẩm sắp hết hàng" type="inner">
          <Space direction="vertical" style={{ width: '100%' }}>
            {lowStockItems.map((item) => (
              <div key={item.id} style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>{item.name}</strong>
                  <span style={{ marginLeft: '12px', color: '#cf1322' }}>
                    Hiện có: {item.current}/{item.minimum}
                  </span>
                </div>
                <Progress
                  percent={(item.current / item.minimum) * 100}
                  strokeColor={item.current < item.minimum * 0.5 ? '#cf1322' : '#faad14'}
                  size="small"
                />
              </div>
            ))}
            <Button type="primary" onClick={() => navigate('/management/stock-requests')}>
              Tạo yêu cầu nhập kho
            </Button>
          </Space>
        </Card>
      )}

      {/* Pending Stock Requests */}
      <Card className="mt-6" title="📦 Yêu cầu nhập kho (FE-10)">
        <Table
          columns={stockRequestColumns}
          dataSource={pendingStockRequests}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      {/* Recent Orders */}
      <Card className="mt-6" title="📋 Đơn hàng gần đây">
        <Table
          columns={orderColumns}
          dataSource={recentOrders}
          pagination={{ pageSize: 5 }}
          size="small"
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
              onClick={() => navigate('/management/inventory')}
              icon={<ShoppingOutlined />}
            >
              Tồn kho
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="default"
              block
              onClick={() => navigate('/management/stock-requests')}
              icon={<TruckOutlined />}
            >
              Nhập kho
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="default"
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
              onClick={() => navigate('/management/promotions')}
              icon={<GiftOutlined />}
            >
              Khuyến mãi
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="dashed"
              block
              onClick={() => navigate('/management/staff')}
              icon={<TeamOutlined />}
            >
              Nhân viên
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default ManagerDashboard
