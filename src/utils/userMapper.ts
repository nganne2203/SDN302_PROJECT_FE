import type { BackendUser, UserInfo } from '@/types/api'

export function mapBackendUserToUserInfo(user: BackendUser): UserInfo {
  const avatarPublicId = user.avatarId || user.avatar

  return {
    id: user._id,
    email: user.email,
    fullname: user.fullname,
    phone: user.phone,
    avatarId: avatarPublicId,
    avatar: user.avatar,
    role: user.role,
    branch: user.branch,
    isEmailVerified: user.isEmailVerified,
    addresses: user.addresses
  }
}
