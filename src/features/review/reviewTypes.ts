import type { PaginationMeta } from '@/types/api'

export interface ReviewUser {
  _id: string
  fullname: string
  email?: string
  avatar?: string
}

export interface ReviewProduct {
  _id: string
  name: string
  slug?: string
  images?: Array<string | { imageUrl: string }>
}

export interface ReviewImage {
  publicId: string
  imageUrl: string
}

export interface Review {
  _id: string
  userId: string | ReviewUser
  productId: string | ReviewProduct
  orderId?: string
  rating: number
  comment?: string
  images?: ReviewImage[]
  isVerifiedPurchase: boolean
  isDeleted?: boolean
  createdAt: string
  updatedAt: string
  user?: ReviewUser
  product?: ReviewProduct
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<string, number>
}

export interface ReviewEligibility {
  canReview: boolean
  hasPurchased: boolean
  hasReviewed: boolean
  existingReview: Review | null
}

export interface CreateReviewRequest {
  productId: string
  rating: number
  comment?: string
  images?: File[]
}

export interface UpdateReviewRequest {
  rating?: number
  comment?: string
  images?: File[]
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
  reviewEligibility: ReviewEligibility | null

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
