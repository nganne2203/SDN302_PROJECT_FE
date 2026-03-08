import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/constant'
import stockRequestApi, { type StockRequestQuery } from '@/apis/stockRequest'
import productApi from '@/apis/product'
import type { Product, StockRequestRecord, StockRequestStatus } from '@/types/api'
import { toast } from '@/utils/toast'
import { extractApiError } from '@/utils/apiError'

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

export const useStockRequest = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === USER_ROLES.ADMIN
  const isManager = user?.role === USER_ROLES.MANAGER

  const [searchParams, setSearchParams] = useSearchParams()

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
  const [pagination, setPagination] = useState({
    current: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('size') || '10'),
    total: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StockRequestStatus | 'all'>(
    (searchParams.get('status') as StockRequestStatus | 'all') || 'all'
  )
  const [products, setProducts] = useState<Product[]>([])
  const [selectedRequest, setSelectedRequest] = useState<StockRequestRecord | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Sync state to URL params
  useEffect(() => {
    const params: Record<string, string> = {}
    if (statusFilter !== 'all') params.status = statusFilter
    if (pagination.current > 1) params.page = String(pagination.current)
    if (pagination.pageSize !== 10) params.size = String(pagination.pageSize)
    setSearchParams(params, { replace: true })
  }, [statusFilter, pagination.current, pagination.pageSize, setSearchParams])

  const query: StockRequestQuery = useMemo(
    () => ({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
    []
  )

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
      if (isManager && !user?.branch) return
      const params = {
        ...query,
        page: pagination.current,
        limit: pagination.pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter
      }
      const cacheKey = buildKey(`stock-request:${isAdmin ? 'admin' : 'manager'}:${user?.branch || ''}`, params)
      const cached = !force ? getCached<{ data: StockRequestRecord[]; pagination: typeof pagination }>(cacheKey) : null

      if (cached) {
        setRequests(cached.data)
        setPagination((prev) => ({ ...prev, ...cached.pagination }))
        setError(null)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const response = isAdmin
          ? await stockRequestApi.getAll(params)
          : await stockRequestApi.getByBranch(user?.branch || '', params)
        const nextPagination = {
          total: response.pagination?.totalItems || 0,
          current: response.pagination?.currentPage || pagination.current,
          pageSize: response.pagination?.pageSize || pagination.pageSize
        }
        setRequests(response.data)
        setPagination((prev) => ({ ...prev, ...nextPagination }))
        setCached(cacheKey, { data: response.data, pagination: nextPagination })
      } catch (err) {
        if (isForbidden(err)) {
          setError('Bạn không có quyền thực hiện thao tác này')
        } else {
          setError(extractApiError(err, 'Không thể tải danh sách yêu cầu nhập kho'))
        }
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getCached, isAdmin, isManager, pagination.current, pagination.pageSize, query, setCached, statusFilter, user?.branch]
  )

  useEffect(() => {
    fetchProducts().catch(() => undefined)
  }, [fetchProducts])

  useEffect(() => {
    fetchRequests().catch(() => undefined)
  }, [fetchRequests])

  const createRequest = useCallback(
    async (data: { product: string; quantity: number; reason?: string }) => {
      if (!user?.branch) {
        throw new Error('missing_branch')
      }
      const response = await stockRequestApi.createStockRequest({
        branch: user.branch,
        product: data.product,
        quantity: data.quantity,
        reason: data.reason
      })
      setRequests((prev) => [response.data, ...prev])
      cacheRef.current.forEach((entry, key) => {
        if (key.includes(`stock-request:${isAdmin ? 'admin' : 'manager'}:${user.branch}`)) {
          const cached = entry.data as { data: StockRequestRecord[]; pagination: typeof pagination }
          setCached(key, { ...cached, data: [response.data, ...cached.data] })
        }
      })
      return response.data
    },
    [isAdmin, setCached, user?.branch]
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

  const fetchDetail = useCallback(
    async (requestId: string) => {
      setDetailLoading(true)
      try {
        const response = await stockRequestApi.getDetail(requestId)
        setSelectedRequest(response.data)
        return response.data
      } catch (err) {
        if (isForbidden(err)) {
          toast.error('Bạn không có quyền thực hiện thao tác này')
        } else {
          toast.error(extractApiError(err, 'Không thể tải chi tiết yêu cầu'))
        }
        return null
      } finally {
        setDetailLoading(false)
      }
    },
    []
  )

  const retry = useCallback(() => {
    setError(null)
    fetchRequests(true).catch(() => undefined)
  }, [fetchRequests])

  return {
    user,
    isAdmin,
    isManager,
    requests,
    pagination,
    setPagination,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    products,
    pendingCount,
    approvedCount,
    fetchRequests,
    createRequest,
    updateRequestStatus,
    selectedRequest,
    setSelectedRequest,
    detailLoading,
    fetchDetail,
    retry
  }
}

export default useStockRequest
