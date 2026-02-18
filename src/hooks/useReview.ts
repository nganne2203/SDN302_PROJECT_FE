import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import {
  fetchProductReviewsThunk,
  fetchProductReviewStatsThunk,
  checkCanReviewThunk,
  fetchMyReviewsThunk,
  fetchAllReviewsThunk,
  createReviewThunk,
  updateReviewThunk,
  deleteReviewThunk
} from '@/features/review/reviewThunks'
import { clearError, resetProductReviews } from '@/features/review/reviewSlice'
import type { ReviewFilter, CreateReviewRequest, UpdateReviewRequest } from '@/features/review/reviewTypes'

export const useReview = () => {
  const dispatch = useAppDispatch()
  const {
    productReviews,
    productReviewsPagination,
    productStats,
    canReview,
    myReviews,
    myReviewsPagination,
    allReviews,
    allReviewsPagination,
    isLoading,
    isSubmitting,
    error
  } = useAppSelector((state) => state.review)

  const fetchProductReviews = useCallback(
    (productId: string, filter?: ReviewFilter) => {
      dispatch(fetchProductReviewsThunk({ productId, filter }))
    },
    [dispatch]
  )

  const fetchProductStats = useCallback(
    (productId: string) => {
      dispatch(fetchProductReviewStatsThunk(productId))
    },
    [dispatch]
  )

  const checkCanReview = useCallback(
    (productId: string) => {
      dispatch(checkCanReviewThunk(productId))
    },
    [dispatch]
  )

  const fetchMyReviews = useCallback(
    (filter?: ReviewFilter) => {
      dispatch(fetchMyReviewsThunk(filter))
    },
    [dispatch]
  )

  const fetchAllReviews = useCallback(
    (filter?: ReviewFilter) => {
      dispatch(fetchAllReviewsThunk(filter))
    },
    [dispatch]
  )

  const createReview = useCallback(
    async (data: CreateReviewRequest) => {
      const result = await dispatch(createReviewThunk(data))
      return createReviewThunk.fulfilled.match(result)
    },
    [dispatch]
  )

  const updateReview = useCallback(
    async (id: string, data: UpdateReviewRequest) => {
      const result = await dispatch(updateReviewThunk({ id, data }))
      return updateReviewThunk.fulfilled.match(result)
    },
    [dispatch]
  )

  const deleteReview = useCallback(
    async (id: string) => {
      const result = await dispatch(deleteReviewThunk(id))
      return deleteReviewThunk.fulfilled.match(result)
    },
    [dispatch]
  )

  const resetReviews = useCallback(() => {
    dispatch(resetProductReviews())
  }, [dispatch])

  const dismissError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    productReviews,
    productReviewsPagination,
    productStats,
    canReview,
    myReviews,
    myReviewsPagination,
    allReviews,
    allReviewsPagination,
    isLoading,
    isSubmitting,
    error,
    fetchProductReviews,
    fetchProductStats,
    checkCanReview,
    fetchMyReviews,
    fetchAllReviews,
    createReview,
    updateReview,
    deleteReview,
    resetReviews,
    dismissError
  }
}

export default useReview
