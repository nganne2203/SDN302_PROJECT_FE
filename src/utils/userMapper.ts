import type { BackendUser, UserInfo } from '@/types/api'

export function mapBackendUserToUserInfo(user: BackendUser): UserInfo {
  return {
    id: user._id,
    email: user.email,
    fullName: user.fullname,
    phoneNumber: user.phone,
    avatar: user.avatar,
    role: user.role,
  }
}

