import type { User } from '@/features/user/userTypes'
import type { UpdateUserRequest } from '@/types/api'

const normalizeEmail = (email = '') => email.trim().toLowerCase()

export const getChangedEmailField = (
  user: Pick<User, 'email'>,
  nextEmail?: string
): Pick<UpdateUserRequest, 'email'> => {
  if (!nextEmail) return {}

  if (normalizeEmail(user.email) === normalizeEmail(nextEmail)) {
    return {}
  }

  return { email: nextEmail.trim() }
}
