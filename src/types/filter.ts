/* eslint-disable no-unused-vars */
export type SortOrder = 'asc' | 'desc' | ''

export interface FilterOption {
  label: string
  value: string | number
}

export interface SortConfig {
  field: string
  order: SortOrder
}

export interface FilterParams {
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: SortOrder
  [key: string]: string | number | boolean | undefined | SortOrder
}

export interface FilterConfig {
  defaultSearch?: string
  defaultPage?: number
  defaultLimit?: number
  defaultSortBy?: string
  defaultSortOrder?: SortOrder
  searchDebounceDelay?: number
  limitOptions?: number[]
}

export interface UseFilterOptions extends FilterConfig {
  onFilterChange?: (filters: FilterParams) => void
}

export interface UseFilterReturn {
  filters: FilterParams
  search: string
  page: number
  limit: number
  sortBy: string
  sortOrder: SortOrder
  setSearch: (search: string) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setSortBy: (field: string) => void
  setSortOrder: (order: SortOrder) => void
  setSort: (field: string, order: SortOrder) => void
  setFilter: (key: string, value: string | number | boolean) => void
  setFilters: (filters: Partial<FilterParams>) => void
  resetFilters: () => void
  resetPagination: () => void
  nextPage: () => void
  prevPage: () => void
  debouncedSearch: string
}

export const DEFAULT_FILTER_CONFIG: Required<FilterConfig> = {
  defaultSearch: '',
  defaultPage: 1,
  defaultLimit: 10,
  defaultSortBy: '',
  defaultSortOrder: '',
  searchDebounceDelay: 500,
  limitOptions: [10, 20, 50, 100]
}
