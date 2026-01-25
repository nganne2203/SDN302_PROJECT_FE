import type { Branch, BranchFilter } from '@/types/api'

export interface BranchState {
  branches: Branch[]
  selectedBranch: Branch | null
  filter: BranchFilter
  pagination: {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems: number
  }
  loading: boolean
  error: string | null
}

export const initialBranchState: BranchState = {
  branches: [],
  selectedBranch: null,
  filter: {
    page: 1,
    limit: 10,
    search: '',
    isActive: undefined,
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  },
  loading: false,
  error: null,
}
