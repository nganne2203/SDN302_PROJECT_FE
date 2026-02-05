import { useEffect, useState } from 'react'
import useAuth from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/constant'
import AdminOrderManagement from './order/AdminOrderManagement'
import StaffOrderManagement from './order/StaffOrderManagement'
import ManagerOrderManagement from './order/ManagerOrderManagement'

const ManagementOrders = () => {
  const { user } = useAuth()
  const [OrderComponent, setOrderComponent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    if (!user) return

    // Render component phù hợp với role
    switch (user.role) {
      case USER_ROLES.ADMIN:
        setOrderComponent(() => AdminOrderManagement)
        break
      case USER_ROLES.STAFF:
        setOrderComponent(() => StaffOrderManagement)
        break
      case USER_ROLES.MANAGER:
        setOrderComponent(() => ManagerOrderManagement)
        break
      default:
        setOrderComponent(null)
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