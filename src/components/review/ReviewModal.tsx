import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Rate, Upload } from 'antd'
import { ImagePlus } from 'lucide-react'
import type { UploadFile } from 'antd'
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

const mapReviewImagesToUploadFiles = (images: Review['images'] = []): UploadFile[] =>
  images.map((image, index) => ({
    uid: `existing-${index}`,
    name: image.publicId || `image-${index + 1}`,
    status: 'done',
    url: image.imageUrl
  }))

const fileNameFromUrl = (url: string, fallback: string) => {
  try {
    const pathname = new URL(url).pathname
    const lastSegment = pathname.split('/').pop()
    return lastSegment || fallback
  } catch {
    return fallback
  }
}

const convertExistingUploadToFile = async (file: UploadFile, index: number): Promise<File | null> => {
  if (!file.url) return null

  try {
    const response = await fetch(file.url)
    const blob = await response.blob()
    const fileName = file.name || fileNameFromUrl(file.url, `review-image-${index + 1}`)
    const mimeType = blob.type || 'image/jpeg'

    return new File([blob], fileName, { type: mimeType })
  } catch {
    return null
  }
}

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
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      comment: existingReview?.comment ?? ''
    }
  })

  const rating = (watch('rating') ?? 0) as number
  const [fileList, setFileList] = useState<UploadFile[]>([])

  useEffect(() => {
    if (!isOpen) return
    reset({
      rating: existingReview?.rating ?? 0,
      comment: existingReview?.comment ?? ''
    })
    setFileList(existingReview?.images?.length ? mapReviewImagesToUploadFiles(existingReview.images) : [])
    dismissError()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, existingReview?._id])

  const handleFormSubmit = async (data: FormData) => {
    if (!rating || rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá')
      return
    }

    const newFiles = fileList
      .filter((f) => f.originFileObj)
      .map((f) => f.originFileObj as File)

    const retainedExistingFiles = await Promise.all(
      fileList
        .filter((f) => !f.originFileObj && !!f.url)
        .map((file, index) => convertExistingUploadToFile(file, index))
    )

    const mergedFiles = [
      ...retainedExistingFiles.filter((file): file is File => file !== null),
      ...newFiles
    ]

    let success = false
    if (isEditMode && existingReview) {
      success = await updateReview(existingReview._id, {
        rating: data.rating,
        comment: data.comment || undefined,
        images: mergedFiles.length > 0 ? mergedFiles : undefined
      })
    } else {
      success = await createReview({
        productId,
        orderId: orderId || undefined,
        rating: data.rating as number,
        comment: data.comment || undefined,
        images: newFiles.length > 0 ? newFiles : undefined
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

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ảnh minh họa
            <span className="text-gray-400 font-normal ml-1">(tuỳ chọn, tối đa 5)</span>
          </label>
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith('image/')
              if (!isImage) {
                toast.error('Chỉ được tải lên file ảnh')
                return Upload.LIST_IGNORE
              }
              const isLt5M = file.size / 1024 / 1024 < 5
              if (!isLt5M) {
                toast.error('Ảnh phải nhỏ hơn 5MB')
                return Upload.LIST_IGNORE
              }
              if (fileList.length >= 5) {
                toast.error('Tối đa 5 ảnh')
                return Upload.LIST_IGNORE
              }
              return false // prevent auto upload
            }}
            onChange={({ fileList: newFileList }) => {
              setFileList(newFileList.slice(0, 5))
            }}
            onRemove={(file) => {
              setFileList((prev) => prev.filter((f) => f.uid !== file.uid))
            }}
            accept="image/*"
            multiple
          >
            {fileList.length < 5 && (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <ImagePlus className="w-5 h-5 mb-1" />
                <span className="text-xs">Tải ảnh</span>
              </div>
            )}
          </Upload>
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
