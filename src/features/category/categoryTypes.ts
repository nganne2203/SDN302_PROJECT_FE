import type { PaginationMeta } from '@/types/api'
import type { CacheMetadata } from '@/utils/cacheHelper'

export interface Category {
  _id: string
  name: string
  description?: string
  slug: string
  isActive: boolean
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export interface CategoryState {
  categories: Category[]
  selectedCategory: Category | null
  pagination: PaginationMeta | null
  filter: CategoryFilter
  isLoading: boolean
  error: string | null
  cache: CacheMetadata
}

export interface CategoryFilter {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateCategoryPayload {
  name: string
  description?: string
}

export interface UpdateCategoryPayload {
  id: string
  data: CreateCategoryPayload
}

export interface FetchCategoriesPayload {
  items: Category[]
  pagination: PaginationMeta
}