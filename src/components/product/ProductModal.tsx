import { useState } from 'react'
import {
  ModalCommon,
  ButtonCommon,
  InputField,
  TextAreaField,
  SelectField,
  NumberField
} from '@/components/common'
import type { ProductFormData } from '@/hooks/useProduct'

interface ProductModalProps {
  isOpen: boolean
  isEditMode: boolean
  formData: ProductFormData
  formErrors: Record<string, string>
  isSubmitting: boolean
  isUploadingImages: boolean
  categories: { _id: string; name: string; slug: string }[]
  onClose: () => void
  // eslint-disable-next-line no-unused-vars
  onFormChange: (field: keyof ProductFormData, value: unknown) => void
  onSubmit: () => void
}

const ProductModal = ({
  isOpen,
  isEditMode,
  formData,
  formErrors,
  isSubmitting,
  isUploadingImages,
  categories,
  onClose,
  onFormChange,
  onSubmit
}: ProductModalProps) => {
  const [previewImages, setPreviewImages] = useState<string[]>([])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (files.length === 0) return

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file))
    setPreviewImages([...previewImages, ...previews])

    // Update form data
    onFormChange('imageFiles', [...(formData.imageFiles || []), ...files])
  }

  const handleRemoveExistingImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    onFormChange('images', newImages)
  }

  const handleRemovePreviewImage = (index: number) => {
    const newPreviews = previewImages.filter((_, i) => i !== index)
    const newFiles = (formData.imageFiles || []).filter((_, i) => i !== index)

    setPreviewImages(newPreviews)
    onFormChange('imageFiles', newFiles)
  }

  const categoryOptions = [
    { value: '', label: 'Chọn danh mục' },
    ...categories.map(cat => ({ value: cat._id, label: cat.name }))
  ]

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <ButtonCommon
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || isUploadingImages}
          >
            Hủy
          </ButtonCommon>
          <ButtonCommon
            variant="primary"
            onClick={onSubmit}
            isLoading={isSubmitting || isUploadingImages}
          >
            {isEditMode ? 'Cập nhật' : 'Tạo mới'}
          </ButtonCommon>
        </div>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        {/* Product Name */}
        <InputField
          label="Tên sản phẩm"
          placeholder="Nhập tên sản phẩm..."
          required
          value={formData.name}
          onChange={(e) => onFormChange('name', e.target.value)}
          error={formErrors.name}
        />

        {/* Description */}
        <TextAreaField
          label="Mô tả"
          placeholder="Nhập mô tả sản phẩm..."
          required
          value={formData.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          error={formErrors.description}
          rows={4}
        />

        {/* Category and Price */}
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Danh mục"
            required
            value={formData.categoryId}
            onChange={(e) => onFormChange('categoryId', e.target.value)}
            options={categoryOptions}
            error={formErrors.categoryId}
          />

          <NumberField
            label="Giá (VNĐ)"
            placeholder="0"
            required
            value={formData.price}
            onChange={(value) => onFormChange('price', Number(value))}
            error={formErrors.price}
          />
        </div>

        {/* Material */}
        <InputField
          label="Chất liệu"
          placeholder="Nhập chất liệu..."
          value={formData.material || ''}
          onChange={(e) => onFormChange('material', e.target.value)}
          error={formErrors.material}
        />

        {/* Compatibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thiết bị tương thích
          </label>
          <input
            type="text"
            placeholder="Nhập ID thiết bị, cách nhau bởi dấu phẩy..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.compatibility?.join(', ') || ''}
            onChange={(e) => {
              const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean)
              onFormChange('compatibility', values)
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Nhập các ID thiết bị, phân cách bằng dấu phẩy
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh <span className="text-red-500">*</span>
          </label>

          {/* Existing Images (for edit mode) */}
          {formData.images && formData.images.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Hình ảnh hiện tại:</p>
              <div className="grid grid-cols-4 gap-3">
                {formData.images.map((image, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview New Images */}
          {previewImages.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Hình ảnh mới:</p>
              <div className="grid grid-cols-4 gap-3">
                {previewImages.map((preview, index) => (
                  <div key={`preview-${index}`} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePreviewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click để tải lên</span> hoặc kéo thả
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {formErrors.images && (
            <p className="text-sm text-red-500 mt-1">{formErrors.images}</p>
          )}
        </div>
      </div>
    </ModalCommon>
  )
}

export default ProductModal
