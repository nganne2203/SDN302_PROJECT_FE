import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { ROUTES } from '@/constants/constant'

// Lazy load pages for better performance
import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'

// Lazy loaded components
const Home = lazy(() => import('@/pages/Home'))
const Login = lazy(() => import('@/pages/Login'))
const Cart = lazy(() => import('@/pages/Cart'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

// HOC to wrap lazy components with Suspense
const withSuspense = (Component: ComponentType): ReactNode => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
)

// Route configuration
export const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: withSuspense(Home),
  },
  {
    path: ROUTES.LOGIN,
    element: withSuspense(Login),
  },
  {
    path: ROUTES.CART,
    element: withSuspense(Cart),
  },
  // Add more routes as needed
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
