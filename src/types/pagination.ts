export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationState {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
}

export interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
}

export interface UsePaginationReturn {
  page: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  nextPage: () => void
  prevPage: () => void
  resetPagination: () => void
}

export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
