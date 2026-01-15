import type { Product, ProductFilter } from '@/types/api'
import type { PaginationMeta } from '@/types/api'

export interface ProductState {
  products: Product[]
  selectedProduct: Product | null
  filter: ProductFilter
  pagination: PaginationMeta | null
  categories: { id: string; name: string }[]
  isLoading: boolean
  error: string | null
}

export interface FetchProductsPayload {
  items: Product[]
  pagination: PaginationMeta
}
