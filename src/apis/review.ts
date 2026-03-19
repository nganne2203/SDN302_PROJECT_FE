import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { ReviewEligibility } from '@/features/review/reviewTypes'

export interface Review {
  _id: string
  userId: string | {
    _id: string
    fullname: string
    email?: string
    avatar?: string
  }
  productId: string | {
    _id: string
    name: string
    slug?: string
    images?: Array<string | { imageUrl: string }>
  }
  orderId?: string
  rating: number
  comment?: string
  images?: Array<{ publicId: string; imageUrl: string }>
  isVerifiedPurchase: boolean
  isDeleted?: boolean
  createdAt: string
  updatedAt: string
  user?: {
    _id: string
    fullname: string
    email?: string
    avatar?: string
  }
  product?: {
    _id: string
    name: string
    slug?: string
    images?: Array<string | { imageUrl: string }>
  }
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<string, number>
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
  productId?: string
  rating?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const reviewApi = {
  // Create a review
  createReview: async (data: CreateReviewRequest): Promise<ApiResponse<Review>> => {
    const formData = new FormData()
    formData.append('productId', data.productId)
    formData.append('rating', String(data.rating))
    if (data.comment) formData.append('comment', data.comment)
    if (data.images) {
      data.images.forEach((file) => formData.append('images', file))
    }
    const response = await apiClient.post<ApiResponse<Review>>(
      API_ENDPOINTS.REVIEW.CREATE,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data
  },

  // Get all reviews (Admin)
  getAllReviews: async (filter?: ReviewFilter): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>(
      API_ENDPOINTS.REVIEW.LIST,
      { params: filter }
    )
    return response.data
  },

  // Get my reviews
  getMyReviews: async (filter?: ReviewFilter): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>(
      API_ENDPOINTS.REVIEW.MY_REVIEWS,
      { params: filter }
    )
    return response.data
  },

  // Get reviews by product
  getByProduct: async (productId: string, filter?: ReviewFilter): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>(
      API_ENDPOINTS.REVIEW.BY_PRODUCT(productId),
      { params: filter }
    )
    return response.data
  },

  // Get product review stats
  getProductStats: async (productId: string): Promise<ApiResponse<ReviewStats>> => {
    const response = await apiClient.get<ApiResponse<ReviewStats>>(
      API_ENDPOINTS.REVIEW.PRODUCT_STATS(productId)
    )
    return response.data
  },

  // Check if current user can review a product
  canReview: async (productId: string): Promise<ApiResponse<ReviewEligibility>> => {
    const response = await apiClient.get<ApiResponse<ReviewEligibility>>(
      API_ENDPOINTS.REVIEW.CAN_REVIEW(productId)
    )
    return response.data
  },

  // Get review by ID
  getById: async (id: string): Promise<ApiResponse<Review>> => {
    const response = await apiClient.get<ApiResponse<Review>>(
      API_ENDPOINTS.REVIEW.DETAIL(id)
    )
    return response.data
  },

  // Update review
  updateReview: async (id: string, data: UpdateReviewRequest): Promise<ApiResponse<Review>> => {
    const formData = new FormData()
    if (typeof data.rating === 'number') formData.append('rating', String(data.rating))
    if (data.comment !== undefined) formData.append('comment', data.comment)
    if (data.images?.length) {
      data.images.forEach((file) => formData.append('images', file))
    }
    const response = await apiClient.patch<ApiResponse<Review>>(
      API_ENDPOINTS.REVIEW.UPDATE(id),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data
  },

  // Delete review
  deleteReview: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.REVIEW.DELETE(id)
    )
    return response.data
  }
}

export default reviewApi
