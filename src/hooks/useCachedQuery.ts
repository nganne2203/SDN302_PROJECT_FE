import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type CacheEntry<T> = {
  data?: T
  error?: unknown
  updatedAt: number
  promise?: Promise<T>
}

const cache = new Map<string, CacheEntry<unknown>>()

const buildKey = (keyParts: unknown[]): string => JSON.stringify(keyParts)

export type UseCachedQueryOptions = {
  enabled?: boolean
  staleTimeMs?: number
  keepPreviousData?: boolean
}

export type UseCachedQueryResult<T> = {
  data: T | undefined
  error: unknown
  isLoading: boolean
  isFetching: boolean
  refetch: () => Promise<void>
}

export const useCachedQuery = <T>(
  keyParts: unknown[],
  queryFn: () => Promise<T>,
  options: UseCachedQueryOptions = {}
): UseCachedQueryResult<T> => {
  const { enabled = true, staleTimeMs = 20_000, keepPreviousData = true } = options
  const key = useMemo(() => buildKey(keyParts), [keyParts])
  const mountedRef = useRef(true)
  const queryFnRef = useRef(queryFn)

  useEffect(() => {
    queryFnRef.current = queryFn
  }, [queryFn])

  const [data, setData] = useState<T | undefined>(() => {
    const entry = cache.get(key) as CacheEntry<T> | undefined
    return entry?.data
  })
  const [error, setError] = useState<unknown>(() => {
    const entry = cache.get(key) as CacheEntry<T> | undefined
    return entry?.error
  })
  const [isFetching, setIsFetching] = useState(false)

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return

    const now = Date.now()
    const entry = cache.get(key) as CacheEntry<T> | undefined
    const isFresh = entry?.data !== undefined && now - entry.updatedAt < staleTimeMs

    if (!force && isFresh) {
      setError(entry?.error)
      setData(entry?.data)
      return
    }

    if (entry?.promise && !force) {
      setIsFetching(true)
      try {
        const result = await entry.promise
        if (!mountedRef.current) return
        setData(result)
        setError(undefined)
      } catch (err) {
        if (!mountedRef.current) return
        setError(err)
      } finally {
        if (mountedRef.current) setIsFetching(false)
      }
      return
    }

    if (!keepPreviousData) {
      setData(undefined)
    }

    setIsFetching(true)
    const promise = queryFnRef.current()
    cache.set(key, { ...(entry ?? { updatedAt: 0 }), promise } as CacheEntry<unknown>)

    try {
      const result = await promise
      cache.set(key, { data: result, error: undefined, updatedAt: Date.now() })
      if (!mountedRef.current) return
      setData(result)
      setError(undefined)
    } catch (err) {
      cache.set(key, { data: entry?.data, error: err, updatedAt: Date.now() })
      if (!mountedRef.current) return
      setError(err)
    } finally {
      const latest = cache.get(key) as CacheEntry<T> | undefined
      if (latest && latest.promise) {
        delete latest.promise
        cache.set(key, latest as CacheEntry<unknown>)
      }
      if (mountedRef.current) setIsFetching(false)
    }
  }, [enabled, key, keepPreviousData, staleTimeMs])

  useEffect(() => {
    mountedRef.current = true
    void fetchData(false)
    return () => { mountedRef.current = false }
  }, [fetchData])

  const refetch = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  const isLoading = enabled && data === undefined && isFetching

  return { data, error, isLoading, isFetching, refetch }
}

export default useCachedQuery
