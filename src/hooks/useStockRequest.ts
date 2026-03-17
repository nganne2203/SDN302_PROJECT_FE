import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { USER_ROLES } from '@/constants/constant'
import stockRequestApi, { type StockRequestQuery } from '@/apis/stockRequest'
import inventoryApi from '@/apis/inventory'
import productApi from '@/apis/product'
import userApi from '@/apis/user'
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

  const [searchParams] = useSearchParams()

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
  const [availableInventoryByProduct, setAvailableInventoryByProduct] = useState<Record<string, number>>({})
  const [selectedRequest, setSelectedRequest] = useState<StockRequestRecord | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
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

  const fetchAvailableInventory = useCallback(
    async (productId: string, force = false): Promise<number> => {
      if (!productId) return 0
      if (!force && availableInventoryByProduct[productId] !== undefined) {
        return availableInventoryByProduct[productId]
      }

      try {
        const response = await inventoryApi.getInventoryByProduct(productId)
        const quantity = Math.max(0, response.data?.quantity || 0)
        setAvailableInventoryByProduct((prev) => ({ ...prev, [productId]: quantity }))
        return quantity
      } catch {
        setAvailableInventoryByProduct((prev) => ({ ...prev, [productId]: 0 }))
        return 0
      }
    },
    [availableInventoryByProduct]
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
        setError(null)
        return
      }

      setLoading(true)
      setError(null)
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

        if (isAdmin && response.data.length) {
          const uniqueProductIds = Array.from(
            new Set(response.data.map((item) => item.product?._id).filter(Boolean))
          ) as string[]
          await Promise.all(uniqueProductIds.map((productId) => fetchAvailableInventory(productId, force)))
        }

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
      statusFilter,
      fetchAvailableInventory
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
      await fetchRequests(true)

      return response.data
    },
    [fetchRequests, resolveBranchFromProfile, resolvedBranch]
  )

  const updateRequestStatus = useCallback(
    async (
      requestId: string,
      action: 'approve' | 'reject',
      payload?: { note?: string; approvedQuantity?: number }
    ) => {
      const response = action === 'approve'
        ? await stockRequestApi.approve(requestId, {
          approvedQuantity: payload?.approvedQuantity || 0,
          ...(payload?.note ? { note: payload.note } : {})
        })
        : await stockRequestApi.reject(requestId, payload?.note || '')

      setRequests((prev) => prev.map((item) => (item._id === response.data._id ? response.data : item)))
      cacheRef.current.forEach((entry, key) => {
        if (!key.startsWith('stock-request')) return
        const cached = entry.data as { data: StockRequestRecord[]; pagination: typeof pagination }
        const updated = cached.data.map((item) => (item._id === response.data._id ? response.data : item))
        setCached(key, { ...cached, data: updated })
      })

      if (response.data.product?._id) {
        await fetchAvailableInventory(response.data.product._id, true)
      }

      return response.data
    },
    [fetchAvailableInventory, setCached]
  )

  const pendingCount = useMemo(
    () => requests.filter((req) => req.status === 'pending').length,
    [requests]
  )
  const approvedCount = useMemo(
    () => requests.filter((req) => req.status === 'approved').length,
    [requests]
  )

  const partialCount = useMemo(
    () => requests.filter((req) => req.status === 'partially_approved').length,
    [requests]
  )

  const rejectCount = useMemo(
    () => requests.filter((req) => req.status === 'rejected').length,
    [requests]
  )

  const fetchDetail = useCallback(
    async (requestId: string) => {
      setDetailLoading(true)
      try {
        const response = await stockRequestApi.getDetail(requestId)
        setSelectedRequest(response.data)
        if (response.data.product?._id && isAdmin) {
          await fetchAvailableInventory(response.data.product._id)
        }
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
    [fetchAvailableInventory, isAdmin]
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
    availableInventoryByProduct,
    pendingCount,
    approvedCount,
    partialCount,
    rejectCount,
    fetchRequests,
    createRequest,
    updateRequestStatus,
    selectedRequest,
    setSelectedRequest,
    detailLoading,
    fetchDetail,
    fetchAvailableInventory,
    retry
  }
}

export default useStockRequest
