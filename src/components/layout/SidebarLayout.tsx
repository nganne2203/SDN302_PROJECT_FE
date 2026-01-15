import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/constant'

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

const items: MenuItem[] = [
  getItem('Dashboard', ROUTES.ADMIN.DASHBOARD, <DashboardOutlined />),
  getItem('Sản phẩm', ROUTES.ADMIN.PRODUCTS, <ShoppingOutlined />),
  getItem('Đơn hàng', ROUTES.ADMIN.ORDERS, <ShoppingCartOutlined />),
  getItem('Người dùng', ROUTES.ADMIN.USERS, <UserOutlined />),
  getItem('Danh mục', ROUTES.ADMIN.CATEGORIES, <TagOutlined />),
  getItem('Cài đặt', 'settings', <SettingOutlined />, [
    getItem('Cấu hình chung', 'settings-general'),
    getItem('Thanh toán', 'settings-payment'),
    getItem('Vận chuyển', 'settings-shipping'),
  ]),
]

interface SidebarLayoutProps {
  collapsed?: boolean
}

const SidebarLayout = ({ collapsed = false }: SidebarLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key)
  }

  return (
    <div className="h-full bg-white">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        {collapsed ? (
          <span className="text-2xl font-bold text-blue-600">PA</span>
        ) : (
          <span className="text-xl font-bold text-blue-600">PhoneAcc Admin</span>
        )}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['settings']}
        items={items}
        onClick={handleMenuClick}
        inlineCollapsed={collapsed}
        className="border-r-0"
      />
    </div>
  )
}

export default SidebarLayout
