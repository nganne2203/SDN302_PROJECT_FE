import { Card, Row, Col, Statistic, Table, Button, Tag, Progress } from 'antd'
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  PercentageOutlined,
  ArrowUpOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

const StaffDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const myTasks = [
    {
      key: '1',
      taskId: 'TASK-001',
      description: 'Xử lý đơn hàng ORD-001',
      status: 'pending',
      priority: 'high',
      date: '2024-01-30'
    },
    {
      key: '2',
      taskId: 'TASK-002',
      description: 'Kiểm kê sản phẩm hàng A',
      status: 'completed',
      priority: 'medium',
      date: '2024-01-29'
    },
    {
      key: '3',
      taskId: 'TASK-003',
      description: 'Đóng gói đơn hàng ORD-003',
      status: 'in_progress',
      priority: 'high',
      date: '2024-01-28'
    }
  ]

  const taskColumns = [
    {
      title: 'Mã công việc',
      dataIndex: 'taskId',
      key: 'taskId'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colorMap: Record<string, string> = {
          high: 'red',
          medium: 'orange',
          low: 'blue'
        }
        const labelMap: Record<string, string> = {
          high: 'Cao',
          medium: 'Trung bình',
          low: 'Thấp'
        }
        return <Tag color={colorMap[priority]}>{labelMap[priority]}</Tag>
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          pending: 'warning',
          in_progress: 'processing',
          completed: 'success'
        }
        const labelMap: Record<string, string> = {
          pending: 'Chờ xử lý',
          in_progress: 'Đang làm',
          completed: 'Hoàn thành'
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Nhân Viên</h1>
        <p className="text-gray-500">
          Xin chào, {user?.fullName}! Đây là bảng điều khiển công việc của bạn.
        </p>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Công việc hôm nay"
              value={5}
              prefix={<FileTextOutlined className="text-blue-600" />}
              styles={{ content: { color: '#1890ff' } }}
            />
            <p className="text-xs text-blue-600 mt-2">
              2 công việc chưa hoàn thành
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Công việc hoàn thành"
              value={42}
              prefix={<CheckCircleOutlined className="text-green-600" />}
              styles={{ content: { color: '#52c41a' } }}
            />
            <p className="text-xs text-green-600 mt-2">
              <ArrowUpOutlined /> Tuần này
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Đơn hàng được xử lý"
              value={23}
              prefix={<ShoppingCartOutlined className="text-orange-600" />}
              styles={{ content: { color: '#fa8c16' } }}
            />
            <p className="text-xs text-orange-600 mt-2">
              Tháng này
            </p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Hiệu suất"
              value={94}
              prefix={<PercentageOutlined className="text-green-600" />}
              styles={{ content: { color: '#3f8600' } }}
              suffix="%"
            />
            <p className="text-xs text-green-600 mt-2">
              Rất tốt
            </p>
          </Card>
        </Col>
      </Row>

      {/* Tasks Progress */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card title="Tiến độ công việc">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">
                  Công việc tuần này: 6/8 (75%)
                </p>
                <Progress
                  percent={75}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068'
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">
                  Đơn hàng đã xử lý: 23/25 (92%)
                </p>
                <Progress
                  percent={92}
                  strokeColor="#52c41a"
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Thống kê">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-sm">Công việc chờ xử lý</span>
                <span className="font-semibold text-blue-600">2</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <span className="text-sm">Công việc đang làm</span>
                <span className="font-semibold text-orange-600">1</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm">Công việc hoàn thành hôm nay</span>
                <span className="font-semibold text-green-600">2</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* My Tasks */}
      <Card className="mt-6" title="Công việc của tôi">
        <Table
          columns={taskColumns}
          dataSource={myTasks}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* Quick Actions */}
      <Card className="mt-6" title="Hành động nhanh">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="primary"
              block
              onClick={() => navigate('/management/orders')}
            >
              📦 Xem đơn hàng
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="default"
              block
              onClick={() => navigate('/management/products')}
            >
              🛒 Xem sản phẩm
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="default"
              block
              onClick={() => navigate('/management/inventory')}
            >
              📊 Kiểm kê
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="default"
              block
            >
              ⚙️ Cài đặt
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default StaffDashboard
