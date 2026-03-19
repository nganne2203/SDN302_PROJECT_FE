import { useEffect, useState } from 'react'
import { Rate, Progress, Pagination, Spin, Empty, Popconfirm } from 'antd'
import { Star, Edit2, Trash2 } from 'lucide-react'
import { useReview } from '@/hooks/useReview'
import { useAppSelector } from '@/apps/hooks'
import ModalCommon from '@/components/common/ModalCommon'
import ReviewModal from './ReviewModal'
import { toast } from '@/utils/toast'
import type { Review } from '@/features/review/reviewTypes'
import { getAvatarUrl, resolveAvatarUrl } from '@/utils/getAvatar'

interface ReviewSectionProps {
  productId: string
  productName?: string
}

const ReviewSection = ({ productId, productName }: ReviewSectionProps) => {
  const {
    productReviews,
    productReviewsPagination,
    productStats,
    canReview,
    reviewEligibility,
    isLoading,
    isSubmitting,
    fetchProductReviews,
    fetchProductStats,
    checkCanReview,
    deleteReview
  } = useReview()

  const { user } = useAppSelector((state) => state.auth)

  const [page, setPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined)
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [reviewerAvatarUrls, setReviewerAvatarUrls] = useState<Record<string, string>>({})
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!productId) return
    fetchProductReviews(productId, { page, limit: 5, rating: ratingFilter })
    fetchProductStats(productId)
    if (user) checkCanReview(productId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, page, ratingFilter, user])

  useEffect(() => {
    let isCancelled = false

    const reviewers = productReviews
      .map((review) => (typeof review.userId === 'object' ? review.userId : review.user))
      .filter((reviewer): reviewer is NonNullable<typeof reviewer> => !!reviewer)

    if (!reviewers.length) return

    const preloadReviewerAvatars = async () => {
      const resolvedEntries = await Promise.all(
        reviewers.map(async (reviewer) => {
          const syncUrl = getAvatarUrl(reviewer)
          if (syncUrl) return [reviewer._id, syncUrl] as const

          const resolvedUrl = await resolveAvatarUrl(reviewer)
          return resolvedUrl ? ([reviewer._id, resolvedUrl] as const) : null
        })
      )

      if (isCancelled) return

      const nextUrls = Object.fromEntries(
        resolvedEntries.filter((entry): entry is readonly [string, string] => entry !== null)
      )

      if (Object.keys(nextUrls).length > 0) {
        setReviewerAvatarUrls((prev) => ({ ...prev, ...nextUrls }))
      }
    }

    preloadReviewerAvatars()

    return () => {
      isCancelled = true
    }
  }, [productReviews])

  const handleModalClose = () => {
    setIsWriteModalOpen(false)
    setEditingReview(null)
  }

  const handleReviewSuccess = () => {
    fetchProductReviews(productId, { page: 1, limit: 5 })
    fetchProductStats(productId)
    setPage(1)
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
    setIsWriteModalOpen(true)
  }

  const handleDelete = async (reviewId: string) => {
    const success = await deleteReview(reviewId)
    if (success) {
      toast.success('Đã xóa đánh giá')
      fetchProductReviews(productId, { page, limit: 5 })
      fetchProductStats(productId)
    } else {
      toast.error('Không thể xóa đánh giá')
    }
  }

  const getUserId = () => {
    if (!user) return null
    return (user as { _id?: string; id?: string })._id ?? (user as { id?: string }).id ?? null
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

  const totalReviews = productStats?.totalReviews ?? 0
  const avg = productStats?.averageRating ?? 0
  const dist = productStats?.ratingDistribution ?? {}
  const canWriteReview = !!user && !!canReview
  const existingReview = user ? (reviewEligibility?.existingReview ?? null) : null
  const reviewNotice = !user
    ? 'Đăng nhập để đánh giá sản phẩm sau khi mua hàng.'
    : reviewEligibility?.hasReviewed
      ? 'Bạn đã đánh giá sản phẩm này. Bạn có thể chỉnh sửa lại đánh giá của mình.'
      : reviewEligibility?.hasPurchased === false
        ? 'Bạn chỉ có thể đánh giá sau khi đơn hàng đã được giao thành công.'
        : null

  return (
    <div id="product-feedback" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        Đánh giá sản phẩm
        {totalReviews > 0 && (
          <span className="text-sm font-normal text-gray-500">({totalReviews} đánh giá)</span>
        )}
      </h2>

      {/* Stats Summary */}
      {productStats && totalReviews > 0 && (
        <div className="flex flex-col md:flex-row gap-6 mb-8 p-4 bg-gray-50 rounded-xl">
          {/* Average score */}
          <div className="flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-5xl font-bold text-gray-900">{avg.toFixed(1)}</span>
            <Rate disabled value={avg} allowHalf className="my-2 text-sm" />
            <span className="text-sm text-gray-500">{totalReviews} đánh giá</span>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = dist[star] ?? 0
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
              return (
                <div key={star} className="flex items-center gap-2">
                  <button
                    className={`flex items-center gap-1 text-sm w-12 shrink-0 hover:text-yellow-500 transition-colors ${ratingFilter === star ? 'text-yellow-500 font-semibold' : 'text-gray-600'}`}
                    onClick={() => setRatingFilter(ratingFilter === star ? undefined : star)}
                  >
                    {star} <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <Progress
                    percent={pct}
                    strokeColor="#FBBF24"
                    trailColor="#E5E7EB"
                    showInfo={false}
                    className="flex-1 my-0"
                    size="small"
                  />
                  <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rating filter chips */}
      {totalReviews > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${ratingFilter === undefined ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
            onClick={() => { setRatingFilter(undefined); setPage(1) }}
          >
            Tất cả
          </button>
          {[5, 4, 3, 2, 1].filter((s) => (dist[s] ?? 0) > 0).map((star) => (
            <button
              key={star}
              className={`px-3 py-1 rounded-full text-sm border transition-colors flex items-center gap-1 ${ratingFilter === star ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-white text-gray-600 border-gray-300 hover:border-yellow-400'}`}
              onClick={() => { setRatingFilter(ratingFilter === star ? undefined : star); setPage(1) }}
            >
              {star} <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>
      )}

      {/* Write review button */}
      {(canWriteReview || existingReview || !!reviewNotice) && (
        <div className="mb-6">
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            {canWriteReview && (
              <button
                onClick={() => { setEditingReview(null); setIsWriteModalOpen(true) }}
                className="flex w-fit items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Star className="w-4 h-4" />
                Viết đánh giá
              </button>
            )}
            {!canWriteReview && existingReview && (
              <button
                onClick={() => handleEdit(existingReview)}
                className="flex w-fit items-center gap-2 px-5 py-2.5 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa đánh giá của bạn
              </button>
            )}
            {reviewNotice && (
              <p className="text-sm text-gray-600">{reviewNotice}</p>
            )}
          </div>
        </div>
      )}

      {/* Review List */}
      <Spin spinning={isLoading}>
        {productReviews.length === 0 && !isLoading ? (
          <Empty
            description={
              <span className="text-gray-500">
                {ratingFilter
                  ? `Chưa có đánh giá ${ratingFilter} sao`
                  : 'Chưa có đánh giá nào cho sản phẩm này'}
              </span>
            }
            className="py-8"
          />
        ) : (
          <div className="space-y-5">
            {productReviews.map((review) => {
              const reviewer = typeof review.userId === 'object'
                ? review.userId
                : review.user
              const reviewerName = reviewer?.fullname ?? 'Người dùng'
              const reviewerAvatar = reviewer?._id
                ? reviewerAvatarUrls[reviewer._id] || getAvatarUrl(reviewer)
                : undefined
              const currentUserId = getUserId()
              const reviewUserId = typeof review.userId === 'object' ? review.userId._id : review.userId
              const isOwner = !!currentUserId && currentUserId === reviewUserId

              return (
                <div key={review._id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center shrink-0">
                      {reviewerAvatar ? (
                        <img src={reviewerAvatar} alt={reviewerName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-blue-600 font-bold text-sm">
                          {reviewerName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="font-semibold text-gray-900 text-sm">{reviewerName}</span>
                          {review.isVerifiedPurchase && (
                            <span className="ml-2 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                              Đã mua hàng
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                      </div>

                      <Rate disabled value={review.rating} className="text-sm mt-0.5" />

                      {review.comment && (
                        <p className="text-gray-700 text-sm mt-2 leading-relaxed">{review.comment}</p>
                      )}

                      {/* Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {review.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img.imageUrl}
                              alt={`review-${idx}`}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setPreviewImageUrl(img.imageUrl)}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Owner actions */}
                      {isOwner && (
                        <div className="flex gap-3 mt-3">
                          <button
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            onClick={() => handleEdit(review)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Chỉnh sửa
                          </button>
                          <Popconfirm
                            title="Xóa đánh giá này?"
                            description="Hành động này không thể hoàn tác."
                            onConfirm={() => handleDelete(review._id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true, loading: isSubmitting }}
                          >
                            <button className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa
                            </button>
                          </Popconfirm>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Spin>

      {/* Pagination */}
      {productReviewsPagination && productReviewsPagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            current={page}
            total={productReviewsPagination.totalItems}
            pageSize={5}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      )}

      {/* Write / Edit Modal */}
      <ReviewModal
        isOpen={isWriteModalOpen}
        onClose={handleModalClose}
        productId={productId}
        productName={productName}
        existingReview={editingReview}
        onSuccess={handleReviewSuccess}
      />

      <ModalCommon
        isOpen={!!previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
        title="Ảnh đánh giá"
        size="md"
      >
        {previewImageUrl && (
          <div className="flex items-center justify-center">
            <img
              src={previewImageUrl}
              alt="Review preview"
              className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
            />
          </div>
        )}
      </ModalCommon>
    </div>
  )
}

export default ReviewSection
