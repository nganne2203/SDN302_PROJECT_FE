import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  PercentageOutlined,
  ArrowUpOutlined
} from '@ant-design/icons'
import useAuth from '@/hooks/useAuth'
import { ROLE_LABELS, USER_ROLES } from '@/constants/constant'
import AdminDashboard from './admin/AdminDashboard'
import ManagerDashboard from './manager/ManagerDashboard'
import StaffDashboard from './staff/StaffDashboard'

const ManagementDashboard = () => {
  const { user, isAdmin, isManager, isStaff } = useAuth()
  const [stats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    canceledOrders: 0
  })

  useEffect(() => {
    // Fetch dashboard statistics
    // This will be connected to actual API calls later
  }, [])

  // Route to role-specific dashboard
  if (user?.role === USER_ROLES.ADMIN) {
    return <AdminDashboard />
  }

  if (user?.role === USER_ROLES.MANAGER) {
    return <ManagerDashboard />
  }

  if (user?.role === USER_ROLES.STAFF) {
    return <StaffDashboard />
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">
          Xin chào, {user?.fullname}! Bạn đang đăng nhập với vai trò{' '}
          {user?.role ? ROLE_LABELS[user.role] : ''}.
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đơn hàng mới"
              value={stats.pendingOrders}
              prefix={<ShoppingCartOutlined className="text-blue-500" />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>

        {(isAdmin || isManager) && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Doanh thu"
                value={stats.totalRevenue}
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
                title="Tổng người dùng"
                value={stats.totalUsers}
                prefix={<UserOutlined className="text-purple-500" />}
                styles={{ content: { color: '#722ed1' } }}
              />
            </Card>
          </Col>
        )}

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.totalProducts}
              prefix={<ShoppingOutlined className="text-orange-500" />}
              styles={{ content: { color: '#fa8c16' } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        {isAdmin && (
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Tổng đơn hàng"
                value={stats.totalOrders}
                prefix={<FileTextOutlined className="text-blue-600" />}
                styles={{ content: { color: '#0960bd' } }}
              />
            </Card>
          </Col>
        )}

        {(isAdmin || isManager) && (
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Đơn hàng bị hủy"
                value={stats.canceledOrders}
                prefix={<ArrowUpOutlined className="text-red-600" />}
                styles={{ content: { color: '#cf1322' } }}
              />
            </Card>
          </Col>
        )}

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tỷ lệ hoàn thành"
              value={98.5}
              prefix={<PercentageOutlined className="text-green-600" />}
              styles={{ content: { color: '#3f8600' } }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Card className="mt-6" title="Hướng dẫn">
        <div className="text-gray-600 space-y-2">
          {isAdmin && (
            <div>
              <p className="font-semibold">👨‍💼 Quản trị viên hệ thống</p>
              <p>
                Bạn có quyền quản lý toàn bộ hệ thống, bao gồm sản phẩm, người dùng, đơn
                hàng, chi nhánh, và cấu hình hệ thống.
              </p>
            </div>
          )}

          {isManager && (
            <div>
              <p className="font-semibold">👔 Quản lý chi nhánh</p>
              <p>
                Bạn có quyền quản lý chi nhánh được phân công, bao gồm kho hàng, đơn hàng
                tại chi nhánh, và nhân viên.
              </p>
            </div>
          )}

          {isStaff && (
            <div>
              <p className="font-semibold">👨‍🔧 Nhân viên</p>
              <p>Bạn có quyền xem đơn hàng, sản phẩm, và thực hiện các tác vụ cơ bản.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ManagementDashboard
