import { useMemo } from 'react'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  SettingOutlined,
  BankOutlined,
  InboxOutlined,
  GiftOutlined,
  BarChartOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES, USER_ROLES } from '@/constants/constant'
import type { UserRole } from '@/types/api'

type MenuItem = Required<MenuProps>['items'][number]

const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem => {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem
}

const getMenuItemsByRole = (role: UserRole): MenuItem[] => {
  const commonItems: MenuItem[] = [
    getItem('Dashboard', ROUTES.MANAGEMENT.DASHBOARD, <DashboardOutlined />),
  ]

  switch (role) {
    case USER_ROLES.ADMIN:
      return [
        ...commonItems,
        getItem('Chi nhánh', ROUTES.MANAGEMENT.BRANCHES, <BankOutlined />),
        getItem('Kho tổng', ROUTES.MANAGEMENT.INVENTORY_TOTAL, <InboxOutlined />),
        getItem('Sản phẩm', ROUTES.MANAGEMENT.PRODUCTS, <ShoppingOutlined />),
        getItem('Danh mục', ROUTES.MANAGEMENT.CATEGORIES, <TagOutlined />),
        getItem('Đơn hàng', ROUTES.MANAGEMENT.ORDERS, <ShoppingCartOutlined />),
        getItem('Quản lý người dùng', 'users-group', <UserOutlined />, [
          getItem('Tất cả người dùng', ROUTES.MANAGEMENT.USERS),
          getItem('Quản lý nhân viên', ROUTES.MANAGEMENT.STAFF),
        ]),
        getItem('Yêu cầu nhập kho', ROUTES.MANAGEMENT.STOCK_REQUESTS, <FileTextOutlined />),
        getItem('Khuyến mãi', ROUTES.MANAGEMENT.PROMOTIONS, <GiftOutlined />),
        getItem('Báo cáo', ROUTES.MANAGEMENT.ALL_REPORTS, <BarChartOutlined />),
        getItem('Cài đặt', 'settings', <SettingOutlined />, [
          getItem('Thanh toán', ROUTES.MANAGEMENT.PAYMENT_SETTINGS),
          getItem('Vận chuyển', ROUTES.MANAGEMENT.DELIVERY_SETTINGS),
        ]),
      ]

    case USER_ROLES.MANAGER:
      return [
        ...commonItems,
        getItem('Kho chi nhánh', ROUTES.MANAGEMENT.BRANCH_INVENTORY, <InboxOutlined />),
        getItem('Sản phẩm', ROUTES.MANAGEMENT.PRODUCTS, <ShoppingOutlined />),
        getItem('Đơn hàng', ROUTES.MANAGEMENT.ORDERS, <ShoppingCartOutlined />),
        getItem('Nhân viên', ROUTES.MANAGEMENT.STAFF, <TeamOutlined />),
        getItem('Yêu cầu nhập kho', ROUTES.MANAGEMENT.STOCK_REQUESTS, <FileTextOutlined />),
        getItem('Khuyến mãi chi nhánh', ROUTES.MANAGEMENT.BRANCH_PROMOTIONS, <GiftOutlined />),
        getItem('Báo cáo chi nhánh', ROUTES.MANAGEMENT.BRANCH_REPORTS, <BarChartOutlined />),
      ]

    case USER_ROLES.STAFF:
      return [
        ...commonItems,
        getItem('Đơn hàng', ROUTES.MANAGEMENT.ORDERS, <ShoppingCartOutlined />),
        getItem('Kho chi nhánh', ROUTES.MANAGEMENT.BRANCH_INVENTORY, <InboxOutlined />),
        getItem('Hỗ trợ khách hàng', ROUTES.MANAGEMENT.CUSTOMER_SUPPORT, <CustomerServiceOutlined />),
      ]

    default:
      return commonItems
  }
}

interface SidebarLayoutProps {
  collapsed?: boolean
  userRole?: UserRole
}

const SidebarLayout = ({ collapsed = false, userRole = USER_ROLES.CUSTOMER }: SidebarLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = useMemo(() => getMenuItemsByRole(userRole), [userRole])

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key)
  }

  const getRoleName = (role: UserRole): string => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'Admin'
      case USER_ROLES.MANAGER:
        return 'Manager'
      case USER_ROLES.STAFF:
        return 'Staff'
      default:
        return ''
    }
  }

  return (
    <div className="h-full bg-white">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        {collapsed ? (
          <span className="text-2xl font-bold text-blue-600">PA</span>
        ) : (
          <div className="text-center">
            <span className="text-xl font-bold text-blue-600">PhoneAcc</span>
            <span className="block text-xs text-gray-500">{getRoleName(userRole)}</span>
          </div>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['users-group', 'settings']}
        items={menuItems}
        onClick={handleMenuClick}
        inlineCollapsed={collapsed}
        className="border-r-0"
      />
    </div>
  )
}

export default SidebarLayout
