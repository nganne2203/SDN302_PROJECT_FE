import type { UserInfo } from '@/types/api'

// Backend user shape is Mongo-based and typically contains `_id`, `fullname`, `phone`, etc.
export function mapBackendUserToUserInfo(raw: any): UserInfo {
  const id = raw?.id || raw?._id || ''
  const email = raw?.email || ''
  const fullName = raw?.fullName || raw?.fullname || raw?.name || (email ? String(email).split('@')[0] : '')
  const role = (raw?.role || 'CUSTOMER').toString().toUpperCase()

  return {
    id: String(id),
    email: String(email),
    fullName: String(fullName),
    role: role as UserInfo['role'],
    phoneNumber: raw?.phone || raw?.phoneNumber,
    avatar: raw?.avatar,
  }
}

