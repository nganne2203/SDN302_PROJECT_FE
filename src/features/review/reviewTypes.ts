import type { PaginationMeta } from '@/types/api'

export interface ReviewUser {
  _id: string
  fullname: string
  avatar?: string
}

export interface Review {
  _id: string
  userId: string | ReviewUser
  productId: string
  orderId?: string
  rating: number
  comment?: string
  images?: string[]
  isVerifiedPurchase: boolean
  createdAt: string
  updatedAt: string
  user?: ReviewUser
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<string, number>
}

export interface CreateReviewRequest {
  productId: string
  orderId?: string
  rating: number
  comment?: string
  images?: File[]
}

export interface UpdateReviewRequest {
  rating?: number
  comment?: string
  images?: string[]
}

export interface ReviewFilter {
  page?: number
  limit?: number
  rating?: number
  productId?: string
  sortBy?: 'createdAt' | 'rating'
  sortOrder?: 'asc' | 'desc'
}

export interface ReviewState {
  // Reviews for a product (public listing)
  productReviews: Review[]
  productReviewsPagination: PaginationMeta | null
  productStats: ReviewStats | null
  canReview: boolean | null

  // My reviews
  myReviews: Review[]
  myReviewsPagination: PaginationMeta | null

  // All reviews (admin)
  allReviews: Review[]
  allReviewsPagination: PaginationMeta | null

  isLoading: boolean
  isSubmitting: boolean
  error: string | null
}

export interface FetchReviewsPayload {
  items: Review[]
  pagination: PaginationMeta
}
