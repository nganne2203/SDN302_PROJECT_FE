import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { TablePaginationConfig } from 'antd/es/table'
import { jwtDecode } from 'jwt-decode'
import useAuth from '@/hooks/useAuth'
import { useAppSelector } from '@/apps/hooks'
import { USER_ROLES } from '@/constants/constant'
import { branchApi } from '@/apis/branch'
import storeInventoryApi, { type StoreInventoryQuery, type CreateStoreInventoryPayload } from '@/apis/storeInventory'
import inventoryApi, { type InventoryQuery } from '@/apis/inventory'
import type { Branch, InventoryRecord, StoreInventoryRecord, TokenPayload } from '@/types/api'
import { toast } from '@/utils/toast'
import { extractApiError } from '@/utils/apiError'

export type BranchView = 'all' | 'out_of_stock' | 'low_stock' | 'need_restock' | 'overstock'

type CacheEntry<T> = { ts: number; data: T }

const CACHE_TTL_MS = 30000

const buildKey = (prefix: string, params: Record<string, unknown>) => {
  return `${prefix}:${JSON.stringify(params)}`
}

const isForbidden = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'response' in error) {
    const resp = error as { response?: { status?: number } }
    return resp.response?.status === 403
  }
  return false
}

export const useInventory = () => {
  const { user } = useAuth()
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const isAdmin = user?.role === USER_ROLES.ADMIN
  const isManager = user?.role === USER_ROLES.MANAGER
  const isStaff = user?.role === USER_ROLES.STAFF

  const [searchParams, setSearchParams] = useSearchParams()

  const tokenBranchId = useMemo(() => {
    if (!accessToken) return null
    try {
      const payload = jwtDecode<TokenPayload>(accessToken)
      return payload.branch ?? null
    } catch {
      return null
    }
  }, [accessToken])

  const resolvedBranchId = useMemo(
    () => user?.branch || tokenBranchId || null,
    [tokenBranchId, user?.branch]
  )

  const cacheRef = useRef(new Map<string, CacheEntry<unknown>>())

  const getCached = useCallback(<T>(key: string): T | null => {
    const entry = cacheRef.current.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      cacheRef.current.delete(key)
      return null
    }
    return entry.data
  }, [])

  const setCached = useCallback(<T>(key: string, data: T) => {
    cacheRef.current.set(key, { ts: Date.now(), data })
  }, [])

  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    searchParams.get('branchId') || resolvedBranchId
  )
  const [branchView, setBranchView] = useState<BranchView>(
    (searchParams.get('view') as BranchView) || 'all'
  )
  const [searchText, setSearchText] = useState(searchParams.get('search') || '')
  const [mainLowStockOnly, setMainLowStockOnly] = useState(searchParams.get('lowStock') === 'true')

  const [branchLoading, setBranchLoading] = useState(false)
  const [mainLoading, setMainLoading] = useState(false)
  const [branchError, setBranchError] = useState<string | null>(null)
  const [mainError, setMainError] = useState<string | null>(null)
  const [branchInventory, setBranchInventory] = useState<StoreInventoryRecord[]>([])
  const [mainInventory, setMainInventory] = useState<InventoryRecord[]>([])
  const [productInventory, setProductInventory] = useState<InventoryRecord | null>(null)
  const [productInventoryLoading, setProductInventoryLoading] = useState(false)
  const [branchPagination, setBranchPagination] = useState<TablePaginationConfig>({
    current: parseInt(searchParams.get('bPage') || '1'),
    pageSize: parseInt(searchParams.get('bSize') || '10'),
    total: 0
  })
  const [mainPagination, setMainPagination] = useState<TablePaginationConfig>({
    current: parseInt(searchParams.get('mPage') || '1'),
    pageSize: parseInt(searchParams.get('mSize') || '10'),
    total: 0
  })

  // Sync state to URL params
  useEffect(() => {
    const params: Record<string, string> = {}
    if (selectedBranchId) params.branchId = selectedBranchId
    if (branchView !== 'all') params.view = branchView
    if (searchText) params.search = searchText
    if (mainLowStockOnly) params.lowStock = 'true'
    if (branchPagination.current && branchPagination.current > 1) params.bPage = String(branchPagination.current)
    if (branchPagination.pageSize && branchPagination.pageSize !== 10) params.bSize = String(branchPagination.pageSize)
    if (mainPagination.current && mainPagination.current > 1) params.mPage = String(mainPagination.current)
    if (mainPagination.pageSize && mainPagination.pageSize !== 10) params.mSize = String(mainPagination.pageSize)
    setSearchParams(params, { replace: true })
  }, [selectedBranchId, branchView, searchText, mainLowStockOnly, branchPagination.current, branchPagination.pageSize, mainPagination.current, mainPagination.pageSize, setSearchParams])

  const branchQuery: StoreInventoryQuery = useMemo(
    () => ({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
    []
  )
  const mainQuery: InventoryQuery = useMemo(
    () => ({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
    []
  )

  useEffect(() => {
    if (!isAdmin && resolvedBranchId) {
      setSelectedBranchId(resolvedBranchId)
    }
  }, [isAdmin, resolvedBranchId])

  const fetchBranches = useCallback(
    async (force = false) => {
      if (!isAdmin && !isManager && !isStaff) return
      const cacheKey = 'branches'
      const cached = !force ? getCached<Branch[]>(cacheKey) : null
      if (cached) {
        setBranches(cached)
        return
      }

      try {
        const response = await branchApi.getAllBranches()
        setBranches(response.data)
        setCached(cacheKey, response.data)
      } catch (error) {
        if (isForbidden(error)) {
          toast.error('Bạn không có quyền thực hiện thao tác này')
        }
      }
    },
    [getCached, isAdmin, isManager, isStaff, setCached]
  )

  useEffect(() => {
    if (isAdmin) {
      fetchBranches().catch(() => undefined)
    }
  }, [fetchBranches, isAdmin])

  useEffect(() => {
    if (isAdmin && !selectedBranchId && branches.length > 0) {
      setSelectedBranchId(branches[0]._id)
    }
  }, [isAdmin, branches, selectedBranchId])

  const fetchBranchInventory = useCallback(
    async (force = false) => {
      if (!selectedBranchId) return
      const query = {
        ...branchQuery,
        page: branchPagination.current,
        limit: branchPagination.pageSize
      }
      const cacheKey = buildKey(`branch:${selectedBranchId}:${branchView}`, query)
      const cached = !force ? getCached<{ data: StoreInventoryRecord[]; pagination: TablePaginationConfig }>(cacheKey) : null

      if (cached) {
        setBranchInventory(cached.data)
        setBranchPagination((prev) => ({
          ...prev,
          total: cached.pagination.total,
          current: cached.pagination.current,
          pageSize: cached.pagination.pageSize
        }))
        setBranchError(null)
        return
      }

      setBranchLoading(true)
      setBranchError(null)
      try {
        let response
        switch (branchView) {
        case 'out_of_stock':
          response = await storeInventoryApi.getOutOfStock(selectedBranchId, query)
          break
        case 'low_stock':
          response = await storeInventoryApi.getLowStock(selectedBranchId, query)
          break
        case 'need_restock':
          response = await storeInventoryApi.getNeedRestock(selectedBranchId, query)
          break
        case 'overstock':
          response = await storeInventoryApi.getOverstock(selectedBranchId, query)
          break
        default:
          response = await storeInventoryApi.getByBranch(selectedBranchId, query)
          break
        }

        const pagination = {
          total: response.pagination?.totalItems || 0,
          current: response.pagination?.currentPage || branchPagination.current,
          pageSize: response.pagination?.pageSize || branchPagination.pageSize
        }
        setBranchInventory(response.data)
        setBranchPagination((prev) => ({ ...prev, ...pagination }))
        setCached(cacheKey, { data: response.data, pagination })
      } catch (error) {
        if (isForbidden(error)) {
          setBranchError('Bạn không có quyền thực hiện thao tác này')
        } else {
          setBranchError(extractApiError(error, 'Không thể tải dữ liệu tồn kho chi nhánh'))
        }
      } finally {
        setBranchLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [branchPagination.current, branchPagination.pageSize, branchQuery, branchView, getCached, selectedBranchId, setCached]
  )

  const fetchMainInventory = useCallback(
    async (force = false) => {
      if (!isAdmin) return
      const query = {
        ...mainQuery,
        page: mainPagination.current,
        limit: mainPagination.pageSize
      }
      const prefix = mainLowStockOnly ? 'main-low' : 'main'
      const cacheKey = buildKey(prefix, query)
      const cached = !force ? getCached<{ data: InventoryRecord[]; pagination: TablePaginationConfig }>(cacheKey) : null

      if (cached) {
        setMainInventory(cached.data)
        setMainPagination((prev) => ({
          ...prev,
          total: cached.pagination.total,
          current: cached.pagination.current,
          pageSize: cached.pagination.pageSize
        }))
        setMainError(null)
        return
      }

      setMainLoading(true)
      setMainError(null)
      try {
        const response = mainLowStockOnly
          ? await inventoryApi.getLowStock(query)
          : await inventoryApi.getInventories(query)
        const pagination = {
          total: response.pagination?.totalItems || 0,
          current: response.pagination?.currentPage || mainPagination.current,
          pageSize: response.pagination?.pageSize || mainPagination.pageSize
        }
        setMainInventory(response.data)
        setMainPagination((prev) => ({ ...prev, ...pagination }))
        setCached(cacheKey, { data: response.data, pagination })
      } catch (error) {
        if (isForbidden(error)) {
          setMainError('Bạn không có quyền thực hiện thao tác này')
        } else {
          setMainError(extractApiError(error, 'Không thể tải dữ liệu tồn kho kho tổng'))
        }
      } finally {
        setMainLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getCached, isAdmin, mainLowStockOnly, mainPagination.current, mainPagination.pageSize, mainQuery, setCached]
  )

  useEffect(() => {
    fetchBranchInventory().catch(() => undefined)
  }, [fetchBranchInventory])

  useEffect(() => {
    fetchMainInventory().catch(() => undefined)
  }, [fetchMainInventory])

  const filteredBranchInventory = useMemo(() => {
    if (!searchText) return branchInventory
    const keyword = searchText.toLowerCase()
    return branchInventory.filter((item) => item.product?.name?.toLowerCase().includes(keyword))
  }, [branchInventory, searchText])

  const filteredMainInventory = useMemo(() => {
    if (!searchText) return mainInventory
    const keyword = searchText.toLowerCase()
    return mainInventory.filter((item) => item.product?.name?.toLowerCase().includes(keyword))
  }, [mainInventory, searchText])

  const branchStats = useMemo(() => {
    const lowStock = branchInventory.filter((item) => item.quantity < item.minThreshold).length
    const outOfStock = branchInventory.filter((item) => item.quantity <= 0).length
    const optimal = branchInventory.filter((item) => {
      if (item.quantity <= 0) return false
      if (item.quantity < item.minThreshold) return false
      if (item.quantity > item.maxThreshold) return false
      return true
    }).length
    return { lowStock, outOfStock, optimal }
  }, [branchInventory])

  const updateThresholds = useCallback(
    async (branchId: string, productId: string, data: { minThreshold?: number; maxThreshold?: number }) => {
      const response = await storeInventoryApi.updateThresholds(branchId, productId, data)
      setBranchInventory((prev) => prev.map((item) => (item._id === response.data._id ? response.data : item)))
      cacheRef.current.forEach((value, key) => {
        if (key.startsWith(`branch:${branchId}`)) {
          const cached = value.data as { data: StoreInventoryRecord[]; pagination: TablePaginationConfig }
          const updated = cached.data.map((item) => (item._id === response.data._id ? response.data : item))
          setCached(key, { ...cached, data: updated })
        }
      })
      return response.data
    },
    [setCached]
  )

  const createStoreInventory = useCallback(
    async (data: CreateStoreInventoryPayload) => {
      const response = await storeInventoryApi.createStoreInventory(data)
      // Invalidate branch caches and refetch
      cacheRef.current.forEach((_value, key) => {
        if (key.startsWith(`branch:${data.branch}`)) {
          cacheRef.current.delete(key)
        }
      })
      await fetchBranchInventory(true)
      return response.data
    },
    [fetchBranchInventory]
  )

  const deleteStoreInventory = useCallback(
    async (inventoryId: string, branchId: string) => {
      await storeInventoryApi.deleteStoreInventory(inventoryId)
      setBranchInventory((prev) => prev.filter((item) => item._id !== inventoryId))
      cacheRef.current.forEach((_value, key) => {
        if (key.startsWith(`branch:${branchId}`)) {
          cacheRef.current.delete(key)
        }
      })
    },
    []
  )

  const updateMainInventory = useCallback(
    async (inventoryId: string, data: { quantity?: number; location?: string }) => {
      const response = await inventoryApi.updateInventory(inventoryId, data)
      setMainInventory((prev) => prev.map((item) => (item._id === response.data._id ? response.data : item)))
      cacheRef.current.forEach((value, key) => {
        if (key.startsWith('main')) {
          const cached = value.data as { data: InventoryRecord[]; pagination: TablePaginationConfig }
          const updated = cached.data.map((item) => (item._id === response.data._id ? response.data : item))
          setCached(key, { ...cached, data: updated })
        }
      })
      return response.data
    },
    [setCached]
  )

  const createMainInventory = useCallback(
    async (data: { product: string; quantity?: number; location?: string }) => {
      const response = await inventoryApi.createInventory(data)
      // Invalidate all main caches and refetch
      cacheRef.current.forEach((_value, key) => {
        if (key.startsWith('main')) {
          cacheRef.current.delete(key)
        }
      })
      await fetchMainInventory(true)
      return response.data
    },
    [fetchMainInventory]
  )

  const adjustMainInventory = useCallback(
    async (productId: string, quantity: number) => {
      const response = await inventoryApi.adjustInventory(productId, quantity)
      setMainInventory((prev) => prev.map((item) => (item.product?._id === productId ? response.data : item)))
      cacheRef.current.forEach((value, key) => {
        if (key.startsWith('main')) {
          const cached = value.data as { data: InventoryRecord[]; pagination: TablePaginationConfig }
          const updated = cached.data.map((item) => (item.product?._id === productId ? response.data : item))
          setCached(key, { ...cached, data: updated })
        }
      })
      return response.data
    },
    [setCached]
  )

  const fetchProductInventory = useCallback(
    async (productId: string) => {
      setProductInventoryLoading(true)
      try {
        const response = await inventoryApi.getInventoryByProduct(productId)
        setProductInventory(response.data)
        return response.data
      } catch (error) {
        if (isForbidden(error)) {
          toast.error('Bạn không có quyền thực hiện thao tác này')
        }
        setProductInventory(null)
        return null
      } finally {
        setProductInventoryLoading(false)
      }
    },
    []
  )

  const retryBranch = useCallback(() => {
    setBranchError(null)
    fetchBranchInventory(true).catch(() => undefined)
  }, [fetchBranchInventory])

  const retryMain = useCallback(() => {
    setMainError(null)
    fetchMainInventory(true).catch(() => undefined)
  }, [fetchMainInventory])

  return {
    user,
    isAdmin,
    isManager,
    isStaff,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    branchView,
    setBranchView,
    searchText,
    setSearchText,
    mainLowStockOnly,
    setMainLowStockOnly,
    branchInventory,
    mainInventory,
    filteredBranchInventory,
    filteredMainInventory,
    branchStats,
    branchLoading,
    mainLoading,
    branchError,
    mainError,
    branchPagination,
    setBranchPagination,
    mainPagination,
    setMainPagination,
    fetchBranches,
    fetchBranchInventory,
    fetchMainInventory,
    updateThresholds,
    createStoreInventory,
    deleteStoreInventory,
    updateMainInventory,
    createMainInventory,
    adjustMainInventory,
    productInventory,
    productInventoryLoading,
    fetchProductInventory,
    retryBranch,
    retryMain
  }
}

export default useInventory
