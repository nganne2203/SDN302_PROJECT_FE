import type { Branch, BranchFilter, PaginationMeta } from '@/types/api'
import type { CacheMetadata } from '@/utils/cacheHelper'

export type { Branch, BranchFilter }

export interface BranchState {
  branches: Branch[]
  selectedBranch: Branch | null
  filter: BranchFilter
  pagination: PaginationMeta | null
  isLoading: boolean
  error: string | null
  cache: CacheMetadata
}

export interface FetchBranchesPayload {
  items: Branch[]
  pagination: PaginationMeta
}

export interface CreateBranchPayload {
  name: string
  address: string
  manager?: string | null
}

export interface UpdateBranchPayload {
  name?: string
  address?: string
  manager?: string | null
}

export const initialBranchState: BranchState = {
  branches: [],
  selectedBranch: null,
  filter: {
    page: 1,
    limit: 10,
    search: '',
    isActive: undefined
  },
  pagination: null,
  isLoading: false,
  error: null
}
