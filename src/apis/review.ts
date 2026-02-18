import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface Review {
  _id: string
  userId: string
  productId: string
  orderId?: string
  rating: number
  comment?: string
  images?: string[]
  isVerifiedPurchase: boolean
  createdAt: string
  updatedAt: string
  user?: {
    _id: string
    fullname: string
    avatar?: string
  }
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
  images?: string[]
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
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const reviewApi = {
  // Create a review
  createReview: async (data: CreateReviewRequest): Promise<ApiResponse<Review>> => {
    const response = await apiClient.post<ApiResponse<Review>>(
      API_ENDPOINTS.REVIEW.CREATE,
      data
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
  canReview: async (productId: string): Promise<ApiResponse<{ canReview: boolean }>> => {
    const response = await apiClient.get<ApiResponse<{ canReview: boolean }>>(
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
    const response = await apiClient.patch<ApiResponse<Review>>(
      API_ENDPOINTS.REVIEW.UPDATE(id),
      data
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
