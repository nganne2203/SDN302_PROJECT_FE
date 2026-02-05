/**
 * Cache duration constants (in milliseconds)
 */
export const CACHE_DURATION = {
  SHORT: 2 * 60 * 1000, // 2 minutes - for frequently changing data
  MEDIUM: 5 * 60 * 1000, // 5 minutes - default cache duration
  LONG: 15 * 60 * 1000, // 15 minutes - for rarely changing data
  EXTRA_LONG: 60 * 60 * 1000 // 1 hour - for static/reference data
} as const

/**
 * Cache metadata interface
 */
export interface CacheMetadata {
  lastFetched: number | null
  isStale: boolean
}

/**
 * Check if cached data is still valid
 * @param lastFetched - Timestamp when data was last fetched
 * @param cacheDuration - Duration in milliseconds to consider cache valid
 * @returns true if cache is still valid, false if stale
 */
export const isCacheValid = (
  lastFetched: number | null,
  cacheDuration: number = CACHE_DURATION.MEDIUM
): boolean => {
  if (!lastFetched) return false
  const now = Date.now()
  return now - lastFetched < cacheDuration
}

/**
 * Generate cache key from filter/params object
 * @param params - Filter or query parameters
 * @returns Stringified cache key
 */
export const generateCacheKey = (params?: Record<string, unknown>): string => {
  if (!params || Object.keys(params).length === 0) return 'default'
  return JSON.stringify(params)
}

/**
 * Mark cache as stale (needs refresh on next access)
 */
export const markCacheAsStale = (): CacheMetadata => ({
  lastFetched: null,
  isStale: true
})

/**
 * Update cache metadata after successful fetch
 */
export const updateCacheMetadata = (): CacheMetadata => ({
  lastFetched: Date.now(),
  isStale: false
})

/**
 * Initial cache metadata state
 */
export const initialCacheMetadata = (): CacheMetadata => ({
  lastFetched: null,
  isStale: false
})
