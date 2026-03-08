import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useAuth from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/constant'
import stockRequestApi, { type StockRequestQuery } from '@/apis/stockRequest'
import productApi from '@/apis/product'
import userApi from '@/apis/user'
import type { Product, StockRequestRecord, StockRequestStatus } from '@/types/api'

type CacheEntry<T> = { ts: number; data: T }

const CACHE_TTL_MS = 30000

const buildKey = (prefix: string, params: Record<string, unknown>) => {
  return `${prefix}:${JSON.stringify(params)}`
}

export const useStockRequest = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === USER_ROLES.ADMIN
  const isManager = user?.role === USER_ROLES.MANAGER

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

  const [requests, setRequests] = useState<StockRequestRecord[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StockRequestStatus | 'all'>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [resolvedBranch, setResolvedBranch] = useState<string | null | undefined>(user?.branch)

  const query: StockRequestQuery = useMemo(
    () => ({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
    []
  )

  useEffect(() => {
    setResolvedBranch(user?.branch)
  }, [user?.branch])

  const resolveBranchFromProfile = useCallback(async () => {
    if (!isManager) return null
    if (resolvedBranch) return resolvedBranch

    try {
      const profileResponse = await userApi.getProfile()
      const latestBranch = profileResponse.data.branch
      if (latestBranch) {
        setResolvedBranch(latestBranch)
        return latestBranch
      }
      return null
    } catch {
      return null
    }
  }, [isManager, resolvedBranch])

  const fetchProducts = useCallback(
    async (force = false) => {
      if (!isManager) return
      const cacheKey = 'stock-request-products'
      const cached = !force ? getCached<Product[]>(cacheKey) : null
      if (cached) {
        setProducts(cached)
        return
      }
      const response = await productApi.getAllProducts()
      setProducts(response.data)
      setCached(cacheKey, response.data)
    },
    [getCached, isManager, setCached]
  )

  const fetchRequests = useCallback(
    async (force = false) => {
      const branchId = isManager ? (resolvedBranch || await resolveBranchFromProfile()) : null
      if (isManager && !branchId) return

      const params = {
        ...query,
        page: pagination.current,
        limit: pagination.pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter
      }
      const cacheKey = buildKey(`stock-request:${isAdmin ? 'admin' : 'manager'}:${branchId || ''}`, params)
      const cached = !force ? getCached<{ data: StockRequestRecord[]; pagination: typeof pagination }>(cacheKey) : null

      if (cached) {
        setRequests(cached.data)
        setPagination((prev) => ({ ...prev, ...cached.pagination }))
        return
      }

      setLoading(true)
      try {
        const response = isAdmin
          ? await stockRequestApi.getAll(params)
          : await stockRequestApi.getByBranch(branchId || '', params)
        const nextPagination = {
          total: response.pagination?.totalItems || 0,
          current: response.pagination?.currentPage || pagination.current,
          pageSize: response.pagination?.pageSize || pagination.pageSize
        }
        setRequests(response.data)
        setPagination((prev) => ({ ...prev, ...nextPagination }))
        setCached(cacheKey, { data: response.data, pagination: nextPagination })
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      getCached,
      isAdmin,
      isManager,
      pagination.current,
      pagination.pageSize,
      query,
      resolveBranchFromProfile,
      resolvedBranch,
      setCached,
      statusFilter
    ]
  )

  useEffect(() => {
    fetchProducts().catch(() => undefined)
  }, [fetchProducts])

  useEffect(() => {
    fetchRequests().catch(() => undefined)
  }, [fetchRequests])

  const createRequest = useCallback(
    async (data: { product: string; quantity: number; reason?: string }) => {
      const branchId = resolvedBranch || await resolveBranchFromProfile()
      const normalizedReason = data.reason?.trim()

      if (!branchId) {
        throw new Error('missing_branch')
      }

      const response = await stockRequestApi.createStockRequest({
        branch: branchId,
        product: data.product,
        quantity: data.quantity,
        ...(normalizedReason ? { reason: normalizedReason } : {})
      })
      setRequests((prev) => [response.data, ...prev])
      cacheRef.current.forEach((entry, key) => {
        if (key.includes(`stock-request:${isAdmin ? 'admin' : 'manager'}:${branchId}`)) {
          const cached = entry.data as { data: StockRequestRecord[]; pagination: typeof pagination }
          setCached(key, { ...cached, data: [response.data, ...cached.data] })
        }
      })
      return response.data
    },
    [isAdmin, resolveBranchFromProfile, resolvedBranch, setCached]
  )

  const updateRequestStatus = useCallback(
    async (requestId: string, action: 'approve' | 'reject', note?: string) => {
      const response = action === 'approve'
        ? await stockRequestApi.approve(requestId, note)
        : await stockRequestApi.reject(requestId, note || '')

      setRequests((prev) => prev.map((item) => (item._id === response.data._id ? response.data : item)))
      cacheRef.current.forEach((entry, key) => {
        if (!key.startsWith('stock-request')) return
        const cached = entry.data as { data: StockRequestRecord[]; pagination: typeof pagination }
        const updated = cached.data.map((item) => (item._id === response.data._id ? response.data : item))
        setCached(key, { ...cached, data: updated })
      })
      return response.data
    },
    [setCached]
  )

  const pendingCount = useMemo(
    () => requests.filter((req) => req.status === 'pending').length,
    [requests]
  )
  const approvedCount = useMemo(
    () => requests.filter((req) => req.status === 'approved').length,
    [requests]
  )

  return {
    user,
    isAdmin,
    isManager,
    requests,
    pagination,
    setPagination,
    loading,
    statusFilter,
    setStatusFilter,
    products,
    pendingCount,
    approvedCount,
    fetchRequests,
    createRequest,
    updateRequestStatus
  }
}

export default useStockRequest
