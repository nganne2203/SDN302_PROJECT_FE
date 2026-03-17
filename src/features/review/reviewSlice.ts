import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ReviewState, Review, ReviewStats, FetchReviewsPayload, ReviewEligibility } from './reviewTypes'
import {
  fetchProductReviewsThunk,
  fetchProductReviewStatsThunk,
  checkCanReviewThunk,
  fetchMyReviewsThunk,
  fetchAllReviewsThunk,
  createReviewThunk,
  updateReviewThunk,
  deleteReviewThunk
} from './reviewThunks'

const initialState: ReviewState = {
  productReviews: [],
  productReviewsPagination: null,
  productStats: null,
  canReview: null,
  reviewEligibility: null,
  myReviews: [],
  myReviewsPagination: null,
  allReviews: [],
  allReviewsPagination: null,
  isLoading: false,
  isSubmitting: false,
  error: null
}

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetProductReviews: (state) => {
      state.productReviews = []
      state.productReviewsPagination = null
      state.productStats = null
      state.canReview = null
      state.reviewEligibility = null
    }
  },
  extraReducers: (builder) => {
    // Fetch product reviews
    builder
      .addCase(fetchProductReviewsThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProductReviewsThunk.fulfilled, (state, action: PayloadAction<FetchReviewsPayload>) => {
        state.isLoading = false
        state.productReviews = action.payload.items
        state.productReviewsPagination = action.payload.pagination
      })
      .addCase(fetchProductReviewsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Product stats
    builder
      .addCase(fetchProductReviewStatsThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchProductReviewStatsThunk.fulfilled, (state, action: PayloadAction<ReviewStats>) => {
        state.isLoading = false
        state.productStats = action.payload
      })
      .addCase(fetchProductReviewStatsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Can review
    builder
      .addCase(checkCanReviewThunk.fulfilled, (state, action: PayloadAction<ReviewEligibility>) => {
        state.reviewEligibility = action.payload
        state.canReview = action.payload.canReview
      })
      .addCase(checkCanReviewThunk.rejected, (state) => {
        state.reviewEligibility = null
        state.canReview = false
      })

    // My reviews
    builder
      .addCase(fetchMyReviewsThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyReviewsThunk.fulfilled, (state, action: PayloadAction<FetchReviewsPayload>) => {
        state.isLoading = false
        state.myReviews = action.payload.items
        state.myReviewsPagination = action.payload.pagination
      })
      .addCase(fetchMyReviewsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // All reviews
    builder
      .addCase(fetchAllReviewsThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllReviewsThunk.fulfilled, (state, action: PayloadAction<FetchReviewsPayload>) => {
        state.isLoading = false
        state.allReviews = action.payload.items
        state.allReviewsPagination = action.payload.pagination
      })
      .addCase(fetchAllReviewsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create review
    builder
      .addCase(createReviewThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createReviewThunk.fulfilled, (state, action: PayloadAction<Review>) => {
        state.isSubmitting = false
        state.productReviews.unshift(action.payload)
        state.canReview = false
        state.reviewEligibility = {
          canReview: false,
          hasPurchased: true,
          hasReviewed: true,
          existingReview: action.payload
        }
      })
      .addCase(createReviewThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

    // Update review
    builder
      .addCase(updateReviewThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updateReviewThunk.fulfilled, (state, action: PayloadAction<Review>) => {
        state.isSubmitting = false
        const idx = state.productReviews.findIndex((r) => r._id === action.payload._id)
        if (idx !== -1) state.productReviews[idx] = action.payload
        const myIdx = state.myReviews.findIndex((r) => r._id === action.payload._id)
        if (myIdx !== -1) state.myReviews[myIdx] = action.payload
        if (state.reviewEligibility?.existingReview?._id === action.payload._id) {
          state.reviewEligibility.existingReview = action.payload
        }
      })
      .addCase(updateReviewThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

    // Delete review
    builder
      .addCase(deleteReviewThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(deleteReviewThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.isSubmitting = false
        state.productReviews = state.productReviews.filter((r) => r._id !== action.payload)
        state.myReviews = state.myReviews.filter((r) => r._id !== action.payload)
        state.allReviews = state.allReviews.filter((r) => r._id !== action.payload)
        if (state.reviewEligibility?.existingReview?._id === action.payload) {
          state.reviewEligibility = {
            canReview: state.reviewEligibility.hasPurchased,
            hasPurchased: state.reviewEligibility.hasPurchased,
            hasReviewed: false,
            existingReview: null
          }
          state.canReview = state.reviewEligibility.canReview
        }
      })
      .addCase(deleteReviewThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, resetProductReviews } = reviewSlice.actions
export default reviewSlice.reducer
