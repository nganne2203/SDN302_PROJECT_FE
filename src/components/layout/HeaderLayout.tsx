import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Dropdown, Input } from 'antd'
import type { MenuProps } from 'antd'
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  MenuOutlined
} from '@ant-design/icons'
import { ROUTES, MANAGEMENT_ROLES } from '@/constants/constant'
import useAuth from '@/hooks/useAuth'
import ProfileModal from '../auth/ProfileModal'
import cartApi from '@/apis/cart'

const HeaderLayout = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0)
      return
    }

    try {
      const response = await cartApi.getCart()
      const items = response.data?.items || []
      const count = items.length
      setCartCount(count)
    } catch {
      setCartCount(0)
    }
  }, [isAuthenticated])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchCartCount()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [fetchCartCount])

  useEffect(() => {
    const handleCartChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ type?: 'add' | 'sync'; delta?: number }>
      const eventType = customEvent.detail?.type

      if (eventType === 'add') {
        const delta = customEvent.detail?.delta || 0
        setCartCount((prev) => Math.max(prev + delta, 0))
        return
      }

      fetchCartCount()
    }

    window.addEventListener('cart:changed', handleCartChanged)
    return () => {
      window.removeEventListener('cart:changed', handleCartChanged)
    }
  }, [fetchCartCount])

  const managementItem = user?.role && MANAGEMENT_ROLES.includes(user.role)
    ? { key: 'management', label: 'Quản lý hệ thống' }
    : null

  const userMenuItems = isAuthenticated
    ? [
      { key: 'profile', label: 'Tài khoản' },
      { key: 'change-password', label: 'Đổi mật khẩu' },
      { key: 'orders', label: 'Đơn hàng' },
      ...(managementItem ? [managementItem] : []),
      { type: 'divider' as const },
      { key: 'logout', label: 'Đăng xuất' }
    ]
    : [
      { key: 'login', label: 'Đăng nhập' },
      { key: 'register', label: 'Đăng ký' }
    ]

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'profile':
        setIsProfileModalOpen(true)
        break
      case 'change-password':
        navigate(ROUTES.CHANGE_PASSWORD)
        break
      case 'orders':
        navigate(ROUTES.ORDERS)
        break
      case 'management':
        navigate(ROUTES.MANAGEMENT.DASHBOARD)
        break
      case 'logout':
        void logout()
        break
      case 'login':
        navigate(ROUTES.LOGIN)
        break
      case 'register':
        navigate(ROUTES.REGISTER)
        break
      default:
        break
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <div className="flex items-center">
            <Link to={ROUTES.HOME} className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">PhoneAcc</span>
            </Link>
          </div>

          <nav className="hidden md:flex flex-1 items-center justify-center space-x-6">
            <Link to={ROUTES.HOME} className="text-gray-600 hover:text-blue-600">
              Trang chủ
            </Link>
            <Link to={ROUTES.PRODUCTS} className="text-gray-600 hover:text-blue-600">
              Sản phẩm
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link to={ROUTES.CART} className="relative">
              <Badge count={cartCount} size="small" showZero={false}>
                <ShoppingCartOutlined className="text-2xl text-gray-600 hover:text-blue-600" />
              </Badge>
            </Link>
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <UserOutlined className="text-xl" />
                {isAuthenticated && <span>{user?.fullname}</span>}
              </button>
            </Dropdown>
          </div>

          <button
            className="md:hidden p-2 ml-auto"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <MenuOutlined className="text-xl" />
          </button>
        </div>

        <div className="md:hidden pb-4">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined className="text-gray-400" />}
            size="large"
            className="rounded-lg"
          />
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            <Link
              to={ROUTES.PRODUCTS}
              className="block text-gray-600 hover:text-blue-600"
            >
              Sản phẩm
            </Link>
            <Link
              to={ROUTES.CART}
              className="block text-gray-600 hover:text-blue-600"
            >
              Giỏ hàng
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={ROUTES.ORDERS}
                  className="block text-gray-600 hover:text-blue-600"
                >
                  Đơn hàng
                </Link>
                <Link
                  to={ROUTES.CHANGE_PASSWORD}
                  className="block text-gray-600 hover:text-blue-600"
                >
                  Đổi mật khẩu
                </Link>
                {user?.role && MANAGEMENT_ROLES.includes(user.role) && (
                  <Link
                    to={ROUTES.MANAGEMENT.DASHBOARD}
                    className="block text-blue-600 font-semibold hover:text-blue-700"
                  >
                    Quản lý hệ thống
                  </Link>
                )}
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="block text-gray-600 hover:text-blue-600"
                >
                  Tài khoản
                </button>
                <button
                  onClick={logout}
                  className="block text-gray-600 hover:text-blue-600"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="block text-gray-600 hover:text-blue-600"
                >
                  Đăng nhập
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="block text-gray-600 hover:text-blue-600"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  )
}

export default HeaderLayout
