import useAuth from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/constant'
import AdminDashboard from './admin/AdminDashboard'
import ManagerDashboard from './manager/ManagerDashboard'
import StaffDashboard from './staff/StaffDashboard'

const ManagementDashboard = () => {
  const { user } = useAuth()

  switch (user?.role) {
  case USER_ROLES.ADMIN:
    return <AdminDashboard />
  case USER_ROLES.MANAGER:
    return <ManagerDashboard />
  case USER_ROLES.STAFF:
    return <StaffDashboard />
  default:
    return null
  }
}

export default ManagementDashboard
