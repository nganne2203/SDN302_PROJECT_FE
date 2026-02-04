import type { Product, ProductFilter, CreateProductRequest, UpdateProductRequest } from '@/types/api'
import type { PaginationMeta } from '@/types/api'

export interface ProductState {
  products: Product[]
  selectedProduct: Product | null
  filter: ProductFilter
  pagination: PaginationMeta | null
  categories: { _id: string; name: string; slug: string }[]
  featuredProducts: Product[]
  newArrivals: Product[]
  relatedProducts: Product[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
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
