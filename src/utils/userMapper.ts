import type { BackendUser, UserInfo } from '@/types/api'

export function mapBackendUserToUserInfo(user: BackendUser): UserInfo {
  return {
    id: user._id,
    email: user.email,
    fullname: user.fullname,
    phone: user.phone,
    avatarId: user.avatar,
    avatar: user.avatar,
    role: user.role,
    addresses: user.addresses
  }
}
