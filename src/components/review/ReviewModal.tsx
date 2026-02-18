import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Rate } from 'antd'
import { X, Plus } from 'lucide-react'
import ModalCommon from '@/components/common/ModalCommon'
import ButtonCommon from '@/components/common/ButtonCommon'
import FieldCustom from '@/components/common/FieldCustom'
import { toast } from '@/utils/toast'
import { useReview } from '@/hooks/useReview'
import { createReviewSchema, updateReviewSchema } from '@/utils/validator'
import type { CreateReviewFormData, UpdateReviewFormData } from '@/utils/validator'
import type { Review } from '@/features/review/reviewTypes'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName?: string
  orderId?: string
  existingReview?: Review | null
  onSuccess?: () => void
}

const RATING_LABELS: Record<number, string> = {
  1: 'Rất tệ',
  2: 'Tệ',
  3: 'Bình thường',
  4: 'Tốt',
  5: 'Tuyệt vời'
}

type FormData = CreateReviewFormData | UpdateReviewFormData

const ReviewModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  orderId,
  existingReview,
  onSuccess
}: ReviewModalProps) => {
  const { createReview, updateReview, isSubmitting, error, dismissError } = useReview()
  const isEditMode = !!existingReview

  const schema = isEditMode ? updateReviewSchema : createReviewSchema

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      comment: existingReview?.comment ?? '',
      imageUrls: ''
    }
  })

  const rating = (watch('rating') ?? 0) as number
  const [imageList, setImageList] = useState<string[]>(existingReview?.images ?? [])

  useEffect(() => {
    if (!isOpen) return
    reset({
      rating: existingReview?.rating ?? 0,
      comment: existingReview?.comment ?? '',
      imageUrls: ''
    })
    setImageList(existingReview?.images ?? [])
    dismissError()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, existingReview?._id])

  const handleAddImage = () => {
    const url = ((watch('imageUrls') as string | undefined) ?? '').trim()
    if (!url) return
    if (imageList.length >= 5) {
      toast.error('Tối đa 5 ảnh')
      return
    }
    setImageList((prev) => [...prev, url])
    setValue('imageUrls', '')
  }

  const handleRemoveImage = (index: number) => {
    setImageList((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFormSubmit = async (data: FormData) => {
    if (!rating || rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá')
      return
    }

    let success = false
    if (isEditMode && existingReview) {
      success = await updateReview(existingReview._id, {
        rating: data.rating,
        comment: data.comment || undefined,
        images: imageList.length > 0 ? imageList : undefined
      })
    } else {
      success = await createReview({
        productId,
        orderId: orderId || undefined,
        rating: data.rating as number,
        comment: data.comment || undefined,
        images: imageList.length > 0 ? imageList : undefined
      })
    }

    if (success) {
      toast.success(isEditMode ? 'Cập nhật đánh giá thành công' : 'Đánh giá thành công. Cảm ơn bạn!')
      onSuccess?.()
      onClose()
    }
  }

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <ButtonCommon variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </ButtonCommon>
          <ButtonCommon
            onClick={handleSubmit(handleFormSubmit)}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditMode ? 'Cập nhật' : 'Gửi đánh giá'}
          </ButtonCommon>
        </div>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-1">
        {/* Product name hint */}
        {productName && (
          <p className="text-sm text-gray-500 -mt-1 mb-2">{productName}</p>
        )}

        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đánh giá của bạn <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <FieldCustom.Controlled
              name="rating"
              control={control}
              render={({ onChange }) => (
                <Rate
                  value={rating}
                  onChange={(val) => onChange(val)}
                  style={{ fontSize: 32 }}
                />
              )}
            />
            {rating > 0 && (
              <span className="text-sm font-medium text-yellow-500">
                {RATING_LABELS[rating as keyof typeof RATING_LABELS]}
              </span>
            )}
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-500">{errors.rating.message}</p>
          )}
        </div>

        {/* Comment */}
        <FieldCustom.Controlled
          name="comment"
          control={control}
          render={({ value, onChange, onBlur, error }) => (
            <FieldCustom.TextArea
              label="Nhận xét"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={4}
              maxLength={1000}
              showCount
              value={(value as string) ?? ''}
              onChange={onChange}
              onBlur={onBlur}
              error={error}
            />
          )}
        />

        {/* Image URL input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ảnh minh họa
            <span className="text-gray-400 font-normal ml-1">(tuỳ chọn, tối đa 5)</span>
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <FieldCustom.Controlled
                name="imageUrls"
                control={control}
                render={({ value, onChange, onBlur }) => (
                  <FieldCustom.Input
                    placeholder="Nhập URL ảnh và nhấn Thêm..."
                    value={(value as string) ?? ''}
                    onChange={onChange}
                    onBlur={onBlur}
                    onPressEnter={handleAddImage}
                    className="!mb-0"
                  />
                )}
              />
            </div>
            <ButtonCommon
              variant="outline"
              onClick={handleAddImage}
              disabled={imageList.length >= 5}
              type="button"
            >
              <Plus className="w-4 h-4" />
            </ButtonCommon>
          </div>

          {imageList.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {imageList.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`review-${index}`}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </form>
    </ModalCommon>
  )
}

export default ReviewModal
