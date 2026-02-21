import { useState, useEffect } from 'react'
import {
  ModalCommon,
  ButtonCommon,
  InputField,
  TextAreaField,
  SelectField,
  NumberField,
  ControlledField
} from '@/components/common'
import type { ProductFormData } from '@/hooks/useProduct'
import type { Control } from 'react-hook-form'
import { useDevice } from '@/hooks/useDevice'
import type { Device } from '@/features/device/deviceTypes'
import type { Image } from '@/types/api'

interface ProductModalProps {
  isOpen: boolean
  isEditMode: boolean
  isSubmitting: boolean
  isUploadingImages: boolean
  control: Control<ProductFormData>
  categories: { id: string; name: string; slug: string }[]
  existingImages: (Image | string)[]
  imageFiles: File[]
  imageError?: string
  onClose: () => void
  // eslint-disable-next-line no-unused-vars
  onExistingImagesChange: (images: (Image | string)[]) => void
  // eslint-disable-next-line no-unused-vars
  onImageFilesChange: (files: File[]) => void
  onSubmit: () => void
}

const ProductModal = ({
  isOpen,
  isEditMode,
  isSubmitting,
  isUploadingImages,
  control,
  categories,
  existingImages,
  imageFiles,
  imageError,
  onClose,
  onExistingImagesChange,
  onImageFilesChange,
  onSubmit
}: ProductModalProps) => {
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const { devices, fetchAllDevices } = useDevice()

  useEffect(() => {
    if (isOpen) {
      fetchAllDevices()
    }
  }, [isOpen, fetchAllDevices])

  // Sync previewImages with imageFiles from parent — when parent resets imageFiles to [],
  // clear stale preview URLs (fixes: old images persisting after modal reopen)
  useEffect(() => {
    if (imageFiles.length === 0 && previewImages.length > 0) {
      previewImages.forEach(url => URL.revokeObjectURL(url))
      setPreviewImages([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFiles])

  const handleClose = () => {
    setPreviewImages([])
    onClose()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const previews = files.map(file => URL.createObjectURL(file))
    setPreviewImages(prev => [...prev, ...previews])
    onImageFilesChange([...imageFiles, ...files])
  }

  const handleRemoveExistingImage = (index: number) => {
    const newImages = existingImages.filter((_, i) => i !== index)
    onExistingImagesChange(newImages)
  }

  const handleRemovePreviewImage = (index: number) => {
    const newPreviews = previewImages.filter((_, i) => i !== index)
    const newFiles = imageFiles.filter((_, i) => i !== index)
    setPreviewImages(newPreviews)
    onImageFilesChange(newFiles)
  }

  const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }))

  const deviceOptions = devices.map((device: Device) => ({
    value: device._id,
    label: `${device.name} - ${device.brand} ${device.model}`
  }))

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Chinh sua san pham' : 'Them san pham moi'}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <ButtonCommon
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || isUploadingImages}
          >
            Huy
          </ButtonCommon>
          <ButtonCommon
            variant="primary"
            onClick={onSubmit}
            isLoading={isSubmitting || isUploadingImages}
          >
            {isEditMode ? 'Cap nhat' : 'Tao moi'}
          </ButtonCommon>
        </div>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        {/* Product Name */}
        <ControlledField<ProductFormData>
          name="name"
          control={control}
          render={({ value, onChange, onBlur, error }) => (
            <InputField
              label="Ten san pham"
              placeholder="Nhap ten san pham..."
              required
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
            />
          )}
        />

        {/* Description */}
        <ControlledField<ProductFormData>
          name="description"
          control={control}
          render={({ value, onChange, onBlur, error }) => (
            <TextAreaField
              label="Mo ta"
              placeholder="Nhap mo ta san pham..."
              required
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
              rows={4}
            />
          )}
        />

        {/* Category and Price */}
        <div className="grid grid-cols-2 gap-4">
          <ControlledField<ProductFormData>
            name="categoryId"
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <SelectField
                label="Danh muc"
                placeholder="Chon danh muc..."
                required
                value={(value as string) || undefined}
                options={categoryOptions}
                onChange={(val) => onChange(val)}
                onBlur={onBlur}
                error={error}
                allowClear
              />
            )}
          />

          <ControlledField<ProductFormData>
            name="price"
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <NumberField
                label="Gia (VND)"
                placeholder="0"
                required
                value={value as number}
                onChange={(val) => onChange(Number(val))}
                onBlur={onBlur}
                error={error}
              />
            )}
          />
        </div>

        {/* Material */}
        <ControlledField<ProductFormData>
          name="material"
          control={control}
          render={({ value, onChange, onBlur, error }) => (
            <InputField
              label="Chat lieu"
              placeholder="Nhap chat lieu..."
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
            />
          )}
        />

        {/* Compatibility */}
        <ControlledField<ProductFormData>
          name="compatibility"
          control={control}
          render={({ value, onChange, onBlur, error }) => (
            <SelectField
              label="Thiet bi tuong thich"
              placeholder="Chon thiet bi tuong thich..."
              mode="multiple"
              value={(value as string[]) || []}
              onChange={(val) => onChange(val)}
              onBlur={onBlur}
              options={deviceOptions}
              error={error}
              helpText="Chon cac thiet bi tuong thich voi san pham nay"
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            />
          )}
        />

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hinh anh <span className="text-red-500">*</span>
          </label>

          {/* Existing Images (for edit mode) */}
          {existingImages && existingImages.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Hinh anh hien tai:</p>
              <div className="grid grid-cols-4 gap-3">
                {existingImages.map((image, index) => {
                  const imageUrl = typeof image === 'string' ? image : image.imageUrl
                  return (
                    <div key={`existing-${index}`} className="relative group">
                      <img
                        src={imageUrl}
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
                  )
                })}
              </div>
            </div>
          )}

          {/* Preview New Images */}
          {previewImages.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Hinh anh moi:</p>
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
                  <span className="font-semibold">Click de tai len</span> hoac keo tha
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

          {imageError && (
            <p className="text-sm text-red-500 mt-1">{imageError}</p>
          )}
        </div>
      </div>
    </ModalCommon>
  )
}

export default ProductModal
