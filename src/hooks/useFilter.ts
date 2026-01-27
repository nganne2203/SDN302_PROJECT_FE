import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useDebounce } from './useDebounce'
import type {
  FilterParams,
  UseFilterOptions,
  UseFilterReturn,
  SortOrder
} from '../types/filter'
import { DEFAULT_FILTER_CONFIG } from '../types/filter'

export const useFilter = (options: UseFilterOptions = {}): UseFilterReturn => {
  const config = { ...DEFAULT_FILTER_CONFIG, ...options }

  const [search, setSearchState] = useState<string>(config.defaultSearch)
  const [page, setPageState] = useState<number>(config.defaultPage)
  const [limit, setLimitState] = useState<number>(config.defaultLimit)
  const [sortBy, setSortByState] = useState<string>(config.defaultSortBy)
  const [sortOrder, setSortOrderState] = useState<SortOrder>(config.defaultSortOrder)
  const [customFilters, setCustomFilters] = useState<Record<string, string | number | boolean>>({})

  const debouncedSearch = useDebounce(search, config.searchDebounceDelay)

  const filters = useMemo<FilterParams>(() => {
    const baseFilters: FilterParams = {
      page,
      limit,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
      ...customFilters
    }
    return baseFilters
  }, [debouncedSearch, page, limit, sortBy, sortOrder, customFilters])

  const onFilterChangeRef = useRef(options.onFilterChange)

  useEffect(() => {
    onFilterChangeRef.current = options.onFilterChange
  }, [options.onFilterChange])

  useEffect(() => {
    if (onFilterChangeRef.current) {
      onFilterChangeRef.current(filters)
    }
  }, [filters])

  const setSearch = useCallback((newSearch: string) => {
    setSearchState(newSearch)
    setPageState(DEFAULT_FILTER_CONFIG.defaultPage)
  }, [])

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage)
  }, [])

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit)
    setPageState(DEFAULT_FILTER_CONFIG.defaultPage)
  }, [])

  const setSortBy = useCallback((field: string) => {
    setSortByState(field)
    setPageState(DEFAULT_FILTER_CONFIG.defaultPage)
  }, [])

  const setSortOrder = useCallback((order: SortOrder) => {
    setSortOrderState(order)
    setPageState(DEFAULT_FILTER_CONFIG.defaultPage)
  }, [])

  const setSort = useCallback((field: string, order: SortOrder) => {
    setSortByState(field)
    setSortOrderState(order)
    setPageState(DEFAULT_FILTER_CONFIG.defaultPage)
  }, [])

  const setFilter = useCallback((key: string, value: string | number | boolean) => {
    setCustomFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPageState(DEFAULT_FILTER_CONFIG.defaultPage)
  }, [])

  const setFilters = useCallback((newFilters: Partial<FilterParams>) => {
    const { search: newSearch, page: newPage, limit: newLimit, sortBy: newSortBy, sortOrder: newSortOrder, ...rest } = newFilters

    if (newSearch !== undefined) setSearchState(newSearch)
    if (newPage !== undefined) setPageState(newPage)
    if (newLimit !== undefined) setLimitState(newLimit)
    if (newSortBy !== undefined) setSortByState(newSortBy)
    if (newSortOrder !== undefined) setSortOrderState(newSortOrder)

    if (Object.keys(rest).length > 0) {
      setCustomFilters(prev => {
        const filtered: Record<string, string | number | boolean> = {}
        Object.entries({ ...prev, ...rest }).forEach(([key, value]) => {
          if (value !== undefined && typeof value !== 'object') {
            filtered[key] = value as string | number | boolean
          }
        })
        return filtered
      })
    }
  }, [])

  const resetFilters = useCallback(() => {
    setSearchState(DEFAULT_FILTER_CONFIG.defaultSearch)
    setPageState(DEFAULT_FILTER_CONFIG.defaultPage)
    setLimitState(DEFAULT_FILTER_CONFIG.defaultLimit)
    setSortByState(DEFAULT_FILTER_CONFIG.defaultSortBy)
    setSortOrderState(DEFAULT_FILTER_CONFIG.defaultSortOrder)
    setCustomFilters({})
  }, [])

  const resetPagination = useCallback(() => {
    setPageState(DEFAULT_FILTER_CONFIG.defaultPage)
  }, [])

  const nextPage = useCallback(() => {
    setPageState(prev => prev + 1)
  }, [])

  const prevPage = useCallback(() => {
    setPageState(prev => Math.max(1, prev - 1))
  }, [])

  return {
    filters,
    search,
    page,
    limit,
    sortBy,
    sortOrder,
    setSearch,
    setPage,
    setLimit,
    setSortBy,
    setSortOrder,
    setSort,
    setFilter,
    setFilters,
    resetFilters,
    resetPagination,
    nextPage,
    prevPage,
    debouncedSearch
  }
}

export default useFilter
