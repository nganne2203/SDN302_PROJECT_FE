import type { Product, ProductFilter, CreateProductRequest, UpdateProductRequest } from '@/types/api'
import type { PaginationMeta } from '@/types/api'
import type { CacheMetadata } from '@/utils/cacheHelper'

export interface ProductState {
  products: Product[]
  selectedProduct: Product | null
  filter: ProductFilter
  pagination: PaginationMeta | null
  categories: { id: string; name: string; slug: string }[]
  featuredProducts: Product[]
  newArrivals: Product[]
  relatedProducts: Product[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  // Cache metadata
  cache: {
    products: CacheMetadata
    featuredProducts: CacheMetadata
    newArrivals: CacheMetadata
    categories: CacheMetadata
    relatedProducts: Record<string, CacheMetadata>
    productDetail: Record<string, CacheMetadata>
  }
}

export interface FetchProductsPayload {
  data: Product[]
  pagination: PaginationMeta
}

export interface ProductFormData extends Omit<CreateProductRequest, 'images'> {
  images: string[]
  imageFiles?: File[]
}

export type ProductUpdateData = UpdateProductRequest
