import type { PaginationMeta, Product } from '@/types/api'
import type { CacheMetadata } from '@/utils/cacheHelper'

export interface PricingProduct {
  _id: string
  name: string
  sku?: string
  basePrice?: number
}

export interface PricingRule {
  _id: string
  product: PricingProduct
  minQuantity: number
  maxQuantity: number | null
  pricePerUnit: number
  discountPercentage?: number
  description?: string
  isActive: boolean
  createdBy?: unknown
  updatedBy?: unknown
  createdAt?: string
  updatedAt?: string
}

export interface PricingCalculation {
  product: Product | PricingProduct | Record<string, unknown>
  quantity: number
  pricing: {
    pricePerUnit: number
    totalPrice: number
    originalTotal: number
    savings: number
    discountPercentage: number
  }
}

export interface PricingState {
  pricings: PricingRule[]
  selectedPricing: PricingRule | null
  pagination: PaginationMeta | null
  filter: PricingFilter
  isLoading: boolean
  error: string | null
  cache: CacheMetadata
}

export interface PricingFilter {
  page?: number
  limit?: number
  productId?: string
  isActive?: boolean
}

export interface CreatePricingPayload {
  productId: string
  minQuantity: number
  maxQuantity?: number | null
  pricePerUnit: number
  discountPercentage?: number
  description?: string
}

export interface UpdatePricingPayload {
  minQuantity: number
  maxQuantity?: number | null
  pricePerUnit: number
  discountPercentage?: number
  description?: string
  isActive?: boolean
}

export interface BulkPricingTier {
  minQuantity: number
  maxQuantity?: number | null
  pricePerUnit: number
  discountPercentage?: number
  description?: string
}

export interface BulkPricingPayload {
  productId: string
  tiers: BulkPricingTier[]
}

export interface FetchPricingsPayload {
  items: PricingRule[]
  pagination: PaginationMeta
}
