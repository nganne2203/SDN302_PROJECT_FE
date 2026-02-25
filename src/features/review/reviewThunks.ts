import { createAsyncThunk } from '@reduxjs/toolkit'
import reviewApi from '@/apis/review'
import { extractApiError } from '@/utils/apiError'
import { invalidateProductCache } from '@/features/product/productSlices'
import type {
  ReviewFilter,
  CreateReviewRequest,
  UpdateReviewRequest,
  FetchReviewsPayload,
  ReviewStats
} from './reviewTypes'
import type { Review } from './reviewTypes'

// Get reviews for a product (public)
export const fetchProductReviewsThunk = createAsyncThunk<
  FetchReviewsPayload,
  { productId: string; filter?: ReviewFilter },
  { rejectValue: string }
>('review/fetchByProduct', async ({ productId, filter }, { rejectWithValue }) => {
  try {
    const res = await reviewApi.getByProduct(productId, filter)
    return {
      items: res.data ?? [],
      pagination: res.pagination
    }
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể tải đánh giá sản phẩm'))
  }
})

// Get product review stats
export const fetchProductReviewStatsThunk = createAsyncThunk<
  ReviewStats,
  string,
  { rejectValue: string }
>('review/fetchProductStats', async (productId, { rejectWithValue }) => {
  try {
    const res = await reviewApi.getProductStats(productId)
    return res.data
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể tải thống kê đánh giá'))
  }
})

// Check if user can review
export const checkCanReviewThunk = createAsyncThunk<
  boolean,
  string,
  { rejectValue: string }
>('review/checkCanReview', async (productId, { rejectWithValue }) => {
  try {
    const res = await reviewApi.canReview(productId)
    return res.data.canReview
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể kiểm tra quyền đánh giá'))
  }
})

// Get my reviews
export const fetchMyReviewsThunk = createAsyncThunk<
  FetchReviewsPayload,
  ReviewFilter | undefined,
  { rejectValue: string }
>('review/fetchMyReviews', async (filter, { rejectWithValue }) => {
  try {
    const res = await reviewApi.getMyReviews(filter)
    return {
      items: res.data ?? [],
      pagination: res.pagination
    }
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể tải đánh giá của bạn'))
  }
})

// Fetch all reviews (Admin)
export const fetchAllReviewsThunk = createAsyncThunk<
  FetchReviewsPayload,
  ReviewFilter | undefined,
  { rejectValue: string }
>('review/fetchAll', async (filter, { rejectWithValue }) => {
  try {
    const res = await reviewApi.getAllReviews(filter)
    return {
      items: res.data ?? [],
      pagination: res.pagination
    }
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể tải danh sách đánh giá'))
  }
})

// Create review
export const createReviewThunk = createAsyncThunk<
  Review,
  CreateReviewRequest,
  { rejectValue: string }
>('review/create', async (data, { rejectWithValue, dispatch }) => {
  try {
    const res = await reviewApi.createReview(data)
    dispatch(invalidateProductCache())
    return res.data
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể tạo đánh giá'))
  }
})

// Update review
export const updateReviewThunk = createAsyncThunk<
  Review,
  { id: string; data: UpdateReviewRequest },
  { rejectValue: string }
>('review/update', async ({ id, data }, { rejectWithValue, dispatch }) => {
  try {
    const res = await reviewApi.updateReview(id, data)
    dispatch(invalidateProductCache())
    return res.data
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể cập nhật đánh giá'))
  }
})

// Delete review
export const deleteReviewThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('review/delete', async (id, { rejectWithValue, dispatch }) => {
  try {
    await reviewApi.deleteReview(id)
    dispatch(invalidateProductCache())
    return id
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể xóa đánh giá'))
  }
})
