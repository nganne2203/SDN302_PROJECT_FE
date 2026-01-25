/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { ROUTES, MANAGEMENT_ROLES, USER_ROLES } from '@/constants/constant'
import { getStorage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/constants/constant'
import type { UserRole } from '@/types/api'

// Lazy load pages for better performance
import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'

// Lazy loaded components - Public pages
const Home = lazy(() => import('@/pages/customer/Home'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))
const SetPassword = lazy(() => import('@/pages/auth/SetPassword'))
const Cart = lazy(() => import('@/pages/customer/Cart'))
const AuthCallback = lazy(() => import('@/pages/auth/AuthCallback'))
const Profile = lazy(() => import('@/pages/customer/Profile'))

// Lazy loaded components - Management pages
const ManagementLayout = lazy(() => import('@/components/layout/ManagementLayout'))
const ManagementDashboard = lazy(() => import('@/pages/management/Dashboard'))
const ManagementProducts = lazy(() => import('@/pages/management/Product'))
const ManagementOrders = lazy(() => import('@/pages/management/Order'))
const LoaderCommon = lazy(() => import('@/components/common/LoaderCommon'))
const BranchesManagement = lazy(() => import('@/pages/management/admin/Branch'))
const CategoryManagement = lazy(() => import('@/pages/management/admin/Category'))

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoaderCommon />
  </div>
)

// HOC to wrap lazy components with Suspense
const withSuspense = (Component: ComponentType): ReactNode => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
)

/**
 * Get current user from storage
 */
const getCurrentUser = (): { role: UserRole } | null => {
  try {
    const userStr = getStorage(STORAGE_KEYS.USER_INFO)
    if (userStr) {
      return JSON.parse(userStr)
    }
  } catch {
    return null
  }
  return null
}

/**
 * Check if user is authenticated
 */
const isAuthenticated = (): boolean => {
  return !!getStorage(STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * Protected Route Wrapper - Requires authentication
 */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  return <>{children}</>
}

/**
 * Guest Route Wrapper - Only for non-authenticated users
 */
const GuestRoute = ({ children }: { children: ReactNode }) => {
  if (isAuthenticated()) {
    const user = getCurrentUser()
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
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  
  const user = getCurrentUser()
  if (!user || !MANAGEMENT_ROLES.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />
  }
  
  return <>{children}</>
}

/**
 * Admin Only Route Wrapper
 */
const AdminRoute = ({ children }: { children: ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  
  const user = getCurrentUser()
  if (!user || user.role !== USER_ROLES.ADMIN) {
    return <Navigate to={ROUTES.MANAGEMENT.DASHBOARD} replace />
  }
  
  return <>{children}</>
}

// eslint-disable-next-line 
const ManagerRoute = ({ children }: { children: ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  const user = getCurrentUser()
  if (!user || user.role !== USER_ROLES.MANAGER) {
    return <Navigate to={ROUTES.MANAGEMENT.DASHBOARD} replace />
  }
  return <>{children}</>
}

// eslint-disable-next-line
const StaffRoute = ({ children }: { children: ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  const user = getCurrentUser()
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
    element: withSuspense(Home),
  },
  {
    path: ROUTES.CART,
    element: withSuspense(Cart),
  },

  // ========================
  // Guest Routes (non-authenticated only)
  // ========================
  {
    path: ROUTES.LOGIN,
    element: (
      <GuestRoute>
        {withSuspense(Login)}
      </GuestRoute>
    ),
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <GuestRoute>
        {withSuspense(Register)}
      </GuestRoute>
    ),
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: (
      <GuestRoute>
        {withSuspense(ForgotPassword)}
      </GuestRoute>
    ),
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: (
      <GuestRoute>
        {withSuspense(ResetPassword)}
      </GuestRoute>
    ),
  },

  // ========================
  // Auth Callback Routes
  // ========================
  {
    path: ROUTES.AUTH_CALLBACK,
    element: withSuspense(AuthCallback),
  },
  {
    path: ROUTES.SET_PASSWORD,
    element: withSuspense(SetPassword),
  },

  // ========================
  // Protected Routes (authenticated users)
  // ========================
  {
    path: ROUTES.PROFILE,
    element: (
      <ProtectedRoute>
        {withSuspense(Profile)}
      </ProtectedRoute>
    ),
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
        element: <Navigate to={ROUTES.MANAGEMENT.DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: withSuspense(ManagementDashboard),
      },
      {
        path: 'products',
        element: withSuspense(ManagementProducts),
      },
      {
        path: 'orders',
        element: withSuspense(ManagementOrders),
      },
      {
        path: 'categories',
        element: (
          <AdminRoute>
            {withSuspense(CategoryManagement)}
          </AdminRoute>
        ),
      },
      {
        path: 'branches',
        element: withSuspense(BranchesManagement),
      },
    ],
  },
  // ========================
  // Legacy Routes (redirect to new paths)
  // ========================
  {
    path: '/auth/callback',
    element: <Navigate to={ROUTES.AUTH_CALLBACK} replace />,
  },

  // ========================
  // 404 Not Found
  // ========================
  {
    path: '*',
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-gray-600">Trang không tồn tại</p>
        </div>
      </div>
    ),
  },
]

// Create browser router
export const router = createBrowserRouter(routes)

export default router
