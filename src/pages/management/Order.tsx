import { useMemo } from 'react'
import useAuth from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/constant'
import AdminOrderManagement from './order/AdminOrderManagement'
import StaffOrderManagement from './order/StaffOrderManagement'
import ManagerOrderManagement from './order/ManagerOrderManagement'

const ManagementOrders = () => {
  const { user } = useAuth()

  // Use useMemo to compute component based on user role
  const OrderComponent = useMemo(() => {
    if (!user) return null

    switch (user.role) {
    case USER_ROLES.ADMIN:
      return AdminOrderManagement
    case USER_ROLES.STAFF:
      return StaffOrderManagement
    case USER_ROLES.MANAGER:
      return ManagerOrderManagement
    default:
      return null
    }
  }, [user])

  if (!OrderComponent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Không có quyền truy cập</p>
        </div>
      </div>
    )
  }

  return <OrderComponent />
}

export default ManagementOrders