import { useMemo, useState } from 'react'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  BankOutlined,
  InboxOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  MobileOutlined,
  PercentageOutlined,
  StarOutlined
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
    label
  } as MenuItem
}

const getMenuItemsByRole = (role: UserRole): MenuItem[] => {
  const commonItems: MenuItem[] = [
    getItem('Dashboard', ROUTES.MANAGEMENT.DASHBOARD, <DashboardOutlined />)
  ]

  switch (role) {
  case USER_ROLES.ADMIN:
    return [
      ...commonItems,
      getItem('Chi nhánh', ROUTES.MANAGEMENT.BRANCHES, <BankOutlined />),
      getItem('Kho tổng', ROUTES.MANAGEMENT.INVENTORY_TOTAL, <InboxOutlined />),
      getItem('Sản phẩm', ROUTES.MANAGEMENT.PRODUCTS, <ShoppingOutlined />),
      getItem('Bảng giá', ROUTES.MANAGEMENT.PRICINGS, <PercentageOutlined />),
      getItem('Danh mục', ROUTES.MANAGEMENT.CATEGORIES, <TagOutlined />),
      getItem('Thiết bị', ROUTES.MANAGEMENT.DEVICES, <MobileOutlined />),
      getItem('Đơn hàng', ROUTES.MANAGEMENT.ORDERS, <ShoppingCartOutlined />),
      getItem('Đánh giá', ROUTES.MANAGEMENT.REVIEWS, <StarOutlined />),
      getItem('Quản lý người dùng', 'users-group', <UserOutlined />, [
        getItem('Tất cả người dùng', ROUTES.MANAGEMENT.USERS),
        getItem('Quản lý nhân viên', ROUTES.MANAGEMENT.STAFF)
      ]),
      getItem('Dịch vụ', ROUTES.MANAGEMENT.SERVICES, <CustomerServiceOutlined />),
      getItem('Yêu cầu nhập kho', ROUTES.MANAGEMENT.STOCK_REQUESTS, <FileTextOutlined />),
      getItem('Báo cáo', ROUTES.MANAGEMENT.ALL_REPORTS, <BarChartOutlined />)
    ]

  case USER_ROLES.MANAGER:
    return [
      ...commonItems,
      getItem('Kho chi nhánh', ROUTES.MANAGEMENT.BRANCH_INVENTORY, <InboxOutlined />),
      getItem('Sản phẩm', ROUTES.MANAGEMENT.PRODUCTS, <ShoppingOutlined />),
      getItem('Bảng giá', ROUTES.MANAGEMENT.PRICINGS, <PercentageOutlined />),
      getItem('Đơn hàng', ROUTES.MANAGEMENT.ORDERS, <ShoppingCartOutlined />),
      getItem('Đánh giá', ROUTES.MANAGEMENT.REVIEWS, <StarOutlined />),
      getItem('Người dùng chi nhánh', ROUTES.MANAGEMENT.MANAGER_USERS, <UserOutlined />),
      getItem('Dịch vụ', ROUTES.MANAGEMENT.SERVICES, <CustomerServiceOutlined />),
      getItem('Yêu cầu nhập kho', ROUTES.MANAGEMENT.STOCK_REQUESTS, <FileTextOutlined />),
      getItem('Báo cáo', ROUTES.MANAGEMENT.BRANCH_REPORTS, <BarChartOutlined />)
    ]

  case USER_ROLES.STAFF:
    return [
      ...commonItems,
      getItem('Đơn hàng', ROUTES.MANAGEMENT.ORDERS, <ShoppingCartOutlined />),
      getItem('Đánh giá', ROUTES.MANAGEMENT.REVIEWS, <StarOutlined />),
      getItem('Sản phẩm', ROUTES.MANAGEMENT.PRODUCTS, <ShoppingOutlined />),
      getItem('Dịch vụ', ROUTES.MANAGEMENT.SERVICES, <CustomerServiceOutlined />),
      getItem('Kho chi nhánh', ROUTES.MANAGEMENT.BRANCH_INVENTORY, <InboxOutlined />),
      getItem('Khách hàng', ROUTES.MANAGEMENT.STAFF_CUSTOMERS, <UserOutlined />),
      getItem('Báo cáo', ROUTES.MANAGEMENT.BRANCH_REPORTS, <BarChartOutlined />)
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

  const [openKeys, setOpenKeys] = useState<string[]>(['users-group'])

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (typeof e.key === 'string' && e.key.startsWith('/')) {
      navigate(e.key)
    }
  }

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
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
    <div className='h-full bg-white'>
      <div className='h-16 flex items-center justify-center border-b border-gray-200'>
        {collapsed ? (
          <span className='text-2xl font-bold text-blue-600'>PA</span>
        ) : (
          <div className='text-center'>
            <span className='text-xl font-bold text-blue-600'>PhoneAcc</span>
            <span className='block text-xs text-gray-500'>{getRoleName(userRole)}</span>
          </div>
        )}
      </div>

      <Menu
        mode='inline'
        selectedKeys={[location.pathname]}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        items={menuItems}
        onClick={handleMenuClick}
        inlineCollapsed={collapsed}
        className='border-r-0'
      />
    </div>
  )
}

export default SidebarLayout
