/* eslint-disable react-refresh/only-export-components */
import {
  createBrowserRouter,
  Navigate,
  type RouteObject
} from 'react-router-dom'
import { ROUTES, MANAGEMENT_ROLES, USER_ROLES } from '@/constants/constant'
import { useAppSelector } from '@/apps/hooks'

// Lazy load pages for better performance
import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import CustomerLayout from '@/components/layout/CustomerLayout'

// Lazy loaded components - Public pages
const Home = lazy(() => import('@/pages/customer/Home'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))
const ChangePassword = lazy(() => import('@/pages/auth/ChangePassword'))
const SetPassword = lazy(() => import('@/pages/auth/SetPassword'))
const Cart = lazy(() => import('@/pages/customer/Cart'))
const AuthCallback = lazy(() => import('@/pages/auth/AuthCallback'))
const AuthError = lazy(() => import('@/pages/auth/AuthError'))
const ProductBrowse = lazy(() => import('@/pages/customer/ProductBrowse'))
const ProductDetailPage = lazy(() => import('@/pages/customer/ProductDetailPage'))
const Checkout = lazy(() => import('@/pages/customer/Checkout'))
const PaymentResult = lazy(() => import('@/pages/customer/PaymentResult'))
const PaymentRedirect = lazy(() => import('@/pages/customer/PaymentRedirect'))
const PaymentError = lazy(() => import('@/pages/customer/PaymentError'))
const OrderHistory = lazy(() =>
  import('@/pages/customer/OrderHistory') as Promise<{ default: ComponentType }>
)
const OrderDetailPage = lazy(() => import('@/pages/customer/OrderDetailPage'))

// Lazy loaded components - Management pages
const ManagementLayout = lazy(
  () => import('@/components/layout/ManagementLayout')
)
const ManagementDashboard = lazy(() => import('@/pages/management/Dashboard'))
// const ManagementProducts = lazy(() => import('@/pages/management/Product'))
const ManagementOrders = lazy(() => import('@/pages/management/Order'))
const ManagementInventory = lazy(() => import('@/pages/management/Inventory'))
const ManagementStockRequests = lazy(() => import('@/pages/management/StockRequest'))
const ManagementPricing = lazy(() => import('@/pages/management/Pricing'))
const ManagementReports = lazy(() =>
  import('@/pages/management/Reports') as Promise<{ default: ComponentType }>
)
const LoaderCommon = lazy(() => import('@/components/common/LoaderCommon'))
const BranchesManagement = lazy(
  () => import('@/pages/management/admin/Branch')
)
const CategoryManagement = lazy(
  () => import('@/pages/management/admin/Category')
)
const DeviceManagement = lazy(
  () => import('@/pages/management/admin/Device')
)
const UsersManagement = lazy(() => import('@/pages/management/admin/User'))
const StaffManagement = lazy(() => import('@/pages/management/admin/Staff'))
const ProductManagement = lazy(() => import('@/pages/management/ProductManagement'))
const ServiceProductManagement = lazy(() => import('@/pages/management/ServiceProduct'))
const ManagerUsersManagement = lazy(() => import('@/pages/management/ManagerUser'))
const StaffCustomerManagement = lazy(() => import('@/pages/management/StaffCustomer'))

const LoadingFallback = () => (
  <div className='flex items-center justify-center min-h-screen'>
    <LoaderCommon />
  </div>
)

// HOC to wrap lazy components with Suspense
const withSuspense = (Component: ComponentType): ReactNode => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
)

const withCustomerLayout = (Component: ComponentType): ReactNode => (
  <CustomerLayout>
    {withSuspense(Component)}
  </CustomerLayout>
)

/**
 * Protected Route Wrapper - Requires authentication
 */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  return <>{children}</>
}

/**
 * Guest Route Wrapper - Only for non-authenticated users
 */
const GuestRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  if (isAuthenticated) {
    if (user && MANAGEMENT_ROLES.includes(user.role)) {
      return <Navigate to={ROUTES.MANAGEMENT.DASHBOARD} replace />
    }
    return <Navigate to={ROUTES.HOME} replace />
  }
  return <>{children}</>
}

/**
 * Management Route Wrapper - Only for Admin, Manager, Staff
 */
const ManagementRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!user || !MANAGEMENT_ROLES.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <>{children}</>
}

/**
 * Admin Only Route Wrapper
 */
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!user || user.role !== USER_ROLES.ADMIN) {
    return <Navigate to={ROUTES.MANAGEMENT.DASHBOARD} replace />
  }

  return <>{children}</>
}

/**
 * Admin + Manager Route Wrapper
 */
const AdminManagerRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!user || (user.role !== USER_ROLES.ADMIN && user.role !== USER_ROLES.MANAGER)) {
    return <Navigate to={ROUTES.MANAGEMENT.DASHBOARD} replace />
  }

  return <>{children}</>
}

const StaffRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!user || user.role !== USER_ROLES.STAFF) {
    return <Navigate to={ROUTES.MANAGEMENT.DASHBOARD} replace />
  }

  return <>{children}</>
}

// Route configuration
export const routes: RouteObject[] = [
  // ========================
  // Public Routes
  // ========================
  {
    path: ROUTES.HOME,
    element: withCustomerLayout(Home)
  },
  {
    path: ROUTES.CART,
    element: withCustomerLayout(Cart)
  },
  {
    path: ROUTES.PRODUCTS,
    element: withCustomerLayout(ProductBrowse)
  },
  {
    path: ROUTES.PRODUCT_DETAIL,
    element: withCustomerLayout(ProductDetailPage)
  },
  {
    path: ROUTES.CHECKOUT,
    element: (
      <ProtectedRoute>
        {withCustomerLayout(Checkout)}
      </ProtectedRoute>
    )
  },
  {
    path: ROUTES.PAYMENT_RESULT,
    element: withCustomerLayout(PaymentResult)
  },
  {
    path: ROUTES.PAYMENT_SUCCESS,
    element: withCustomerLayout(PaymentRedirect)
  },
  {
    path: ROUTES.PAYMENT_FAILED,
    element: withCustomerLayout(PaymentRedirect)
  },
  {
    path: ROUTES.PAYMENT_ERROR,
    element: withCustomerLayout(PaymentError)
  },
  {
    path: ROUTES.ORDERS,
    element: (
      <ProtectedRoute>
        {withCustomerLayout(OrderHistory)}
      </ProtectedRoute>
    )
  },
  {
    path: ROUTES.ORDER_DETAIL,
    element: (
      <ProtectedRoute>
        {withCustomerLayout(OrderDetailPage)}
      </ProtectedRoute>
    )
  },
  {
    path: ROUTES.CHANGE_PASSWORD,
    element: (
      <ProtectedRoute>
        {withSuspense(ChangePassword)}
      </ProtectedRoute>
    )
  },

  // ========================
  // Guest Routes (non-authenticated only)
  // ========================
  {
    path: ROUTES.LOGIN,
    element: <GuestRoute>{withSuspense(Login)}</GuestRoute>
  },
  {
    path: ROUTES.REGISTER,
    element: <GuestRoute>{withSuspense(Register)}</GuestRoute>
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <GuestRoute>{withSuspense(ForgotPassword)}</GuestRoute>
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: <GuestRoute>{withSuspense(ResetPassword)}</GuestRoute>
  },

  // ========================
  // Auth Callback Routes
  // ========================
  {
    path: ROUTES.AUTH_CALLBACK,
    element: withSuspense(AuthCallback)
  },
  {
    path: ROUTES.AUTH_ERROR,
    element: withSuspense(AuthError)
  },
  {
    path: ROUTES.SET_PASSWORD,
    element: withSuspense(SetPassword)
  },

  // ========================
  // Management Routes (Admin, Manager, Staff)
  // ========================
  {
    path: '/management',
    element: (
      <ManagementRoute>
        <Suspense fallback={<LoadingFallback />}>
          <ManagementLayout />
        </Suspense>
      </ManagementRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.MANAGEMENT.DASHBOARD} replace />
      },
      {
        path: 'dashboard',
        element: withSuspense(ManagementDashboard)
      },
      {
        path: 'products',
        element: withSuspense(ProductManagement)
      },
      {
        path: 'pricings',
        element: <AdminManagerRoute>{withSuspense(ManagementPricing)}</AdminManagerRoute>
      },
      {
        path: ROUTES.MANAGEMENT.SERVICES,
        element: <ManagementRoute>{withSuspense(ServiceProductManagement)}</ManagementRoute>
      },
      {
        path: 'orders',
        element: withSuspense(ManagementOrders)
      },
      {
        path: 'inventory',
        element: <AdminRoute>{withSuspense(ManagementInventory)}</AdminRoute>
      },
      {
        path: 'branch-inventory',
        element: withSuspense(ManagementInventory)
      },
      {
        path: 'stock-requests',
        element: <AdminManagerRoute>{withSuspense(ManagementStockRequests)}</AdminManagerRoute>
      },
      {
        path: 'reports',
        element: <ManagementRoute>{withSuspense(ManagementReports)}</ManagementRoute>
      },
      {
        path: 'branch-reports',
        element: <ManagementRoute>{withSuspense(ManagementReports)}</ManagementRoute>
      },
      {
        path: 'categories',
        element: <AdminRoute>{withSuspense(CategoryManagement)}</AdminRoute>
      },
      {
        path: 'devices',
        element: <AdminRoute>{withSuspense(DeviceManagement)}</AdminRoute>
      },
      {
        path: 'users',
        element: <AdminRoute>{withSuspense(UsersManagement)}</AdminRoute>
      },
      {
        path: 'staff',
        element: <AdminRoute>{withSuspense(StaffManagement)}</AdminRoute>
      },
      {
        path: 'branches',
        element: <AdminRoute>{withSuspense(BranchesManagement)}</AdminRoute>
      },
      {
        path: 'manager-users',
        element: <AdminManagerRoute>{withSuspense(ManagerUsersManagement)}</AdminManagerRoute>
      },
      {
        path: 'staff-customers',
        element: <StaffRoute>{withSuspense(StaffCustomerManagement)}</StaffRoute>
      }
    ]
  },
  // ========================
  // Legacy Routes (redirect to new paths)
  // ========================
  {
    path: '/auth/callback',
    element: <Navigate to={ROUTES.AUTH_CALLBACK} replace />
  },

  // ========================
  // 404 Not Found
  // ========================
  {
    path: '*',
    element: (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-gray-800 mb-4'>404</h1>
          <p className='text-gray-600'>Trang không tồn tại</p>
        </div>
      </div>
    )
  }
]

// Create browser router
export const router = createBrowserRouter(routes)

export default router
