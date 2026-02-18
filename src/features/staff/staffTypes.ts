import type { PaginationMeta, UserManageFilter } from '@/types/api'
import type { User } from '@/features/user/userTypes'

export interface StaffState {
  staffList: User[]
  selectedStaff: User | null
  pagination: PaginationMeta | null
  filter: UserManageFilter
  listLoading: boolean
  actionLoading: boolean
  error: string | null
}

export interface FetchStaffPayload {
  items: User[]
  pagination: PaginationMeta
}

export type { User, UserManageFilter }
