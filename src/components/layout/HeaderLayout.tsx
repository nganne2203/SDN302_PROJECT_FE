import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Dropdown, Input } from 'antd'
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  SearchOutlined,
  MenuOutlined 
} from '@ant-design/icons'
import { ROUTES } from '@/constants/constant'
import useAuth from '@/hooks/useAuth'

const HeaderLayout = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const userMenuItems = isAuthenticated
    ? [
        { key: 'profile', label: <Link to={ROUTES.PROFILE}>Tài khoản</Link> },
        { key: 'orders', label: <Link to={ROUTES.ORDERS}>Đơn hàng</Link> },
        { type: 'divider' as const },
        { key: 'logout', label: 'Đăng xuất', onClick: logout },
      ]
    : [
        { key: 'login', label: <Link to={ROUTES.LOGIN}>Đăng nhập</Link> },
        { key: 'register', label: <Link to={ROUTES.REGISTER}>Đăng ký</Link> },
      ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">PhoneAcc</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<SearchOutlined className="text-gray-400" />}
              size="large"
              className="rounded-lg"
            />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to={ROUTES.PRODUCTS} className="text-gray-600 hover:text-blue-600">
              Sản phẩm
            </Link>
            <Link to={ROUTES.CART} className="relative">
              <Badge count={3} size="small">
                <ShoppingCartOutlined className="text-2xl text-gray-600 hover:text-blue-600" />
              </Badge>
            </Link>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <UserOutlined className="text-xl" />
                {isAuthenticated && <span>{user?.fullName}</span>}
              </button>
            </Dropdown>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <MenuOutlined className="text-xl" />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined className="text-gray-400" />}
            size="large"
            className="rounded-lg"
          />
        </div>

        {/* Mobile Menu */}
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
              Giỏ hàng (3)
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={ROUTES.PROFILE}
                  className="block text-gray-600 hover:text-blue-600"
                >
                  Tài khoản
                </Link>
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
    </header>
  )
}

export default HeaderLayout
