import { Card, Row, Col, Statistic } from 'antd'
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import useAuth from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/constants/constant'

const ManagementDashboard = () => {
  const { user, isAdmin, isManager, isStaff } = useAuth()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Xin chào, {user?.fullName}! Bạn đang đăng nhập với vai trò {user?.role ? ROLE_LABELS[user.role] : ''}.
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đơn hàng mới"
              value={128}
              prefix={<ShoppingCartOutlined className="text-blue-500" />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        
        {(isAdmin || isManager) && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Doanh thu hôm nay"
                value={15800000}
                prefix={<DollarOutlined className="text-green-500" />}
                styles={{ content: { color: '#52c41a' } }}
                suffix="₫"
              />
            </Card>
          </Col>
        )}

        {isAdmin && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Người dùng mới"
                value={45}
                prefix={<UserOutlined className="text-purple-500" />}
                styles={{ content: { color: '#722ed1' } }}
              />
            </Card>
          </Col>
        )}

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sản phẩm"
              value={1256}
              prefix={<ShoppingOutlined className="text-orange-500" />}
              styles={{ content: { color: '#fa8c16' } }}
            />
          </Card>
        </Col>
      </Row>

      <div className="mt-6">
        {isAdmin && (
          <Card title="Quản trị hệ thống">
            <p className="text-gray-600">
              Bạn có quyền quản lý toàn bộ hệ thống, bao gồm tất cả chi nhánh, kho tổng, 
              người dùng, và cấu hình hệ thống.
            </p>
          </Card>
        )}

        {isManager && (
          <Card title="Quản lý chi nhánh">
            <p className="text-gray-600">
              Bạn có quyền quản lý chi nhánh được phân công, bao gồm kho hàng, đơn hàng, 
              và nhân viên tại chi nhánh.
            </p>
          </Card>
        )}

        {isStaff && (
          <Card title="Nhân viên chi nhánh">
            <p className="text-gray-600">
              Bạn có quyền xử lý đơn hàng, kiểm kê kho, và hỗ trợ khách hàng tại chi nhánh.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ManagementDashboard
