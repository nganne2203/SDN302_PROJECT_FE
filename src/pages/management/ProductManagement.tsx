import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProduct, type ProductFormData, productValidationSchema, initialProductFormValues } from '@/hooks/useProduct'
import type { Product, Image } from '@/types/api'
import { toast } from '@/utils/toast'
import ProductHeader from '@/components/product/ProductHeader'
import ProductFilter from '@/components/product/ProductFilter'
import ProductList from '@/components/product/ProductList'
import ProductModal from '@/components/product/ProductModal'

const toImageArray = (images: Product['images']): (Image | string)[] => {
  if (Array.isArray(images)) return images as (Image | string)[]
  if (images) return [images as Image | string]
  return []
}

const toPublicId = (image: Image | string): string | null => {
  if (typeof image !== 'string') {
    return image.publicId?.trim() || null
  }

  const raw = image.trim()
  if (!raw) return null

  // If already a publicId, keep as-is to avoid mismatching DB values.
  if (!raw.startsWith('http')) return raw

  // Convert Cloudinary URL to publicId for update payload.
  const uploadMarker = '/upload/'
  const markerIndex = raw.indexOf(uploadMarker)
  if (markerIndex < 0) return null

  const afterUpload = raw.slice(markerIndex + uploadMarker.length)
  const segments = afterUpload.split('/').filter(Boolean)
  if (segments.length === 0) return null

  if (/^v\d+$/.test(segments[0])) {
    segments.shift()
  }

  if (segments.length === 0) return null
  const lastIdx = segments.length - 1
  segments[lastIdx] = segments[lastIdx].replace(/\.[a-zA-Z0-9]+$/, '')

  const publicId = segments.join('/')
  return publicId || null
}

const ProductManagement = () => {
  const {
    products,
    pagination,
    categories,
    filter,
    isLoading,
    isSubmitting,
    isUploadingImages,
    selectedProduct,
    fetchProducts,
    fetchCategories,
    updateFilter,
    resetFilter,
    selectProduct,
    createProduct,
    updateProduct,
    handleDelete,
    handleToggleStatus,
    uploadImages
  } = useProduct()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [existingImages, setExistingImages] = useState<(Image | string)[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageError, setImageError] = useState<string>()

  const {
    control,
    handleSubmit,
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(productValidationSchema),
    defaultValues: initialProductFormValues
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (Object.keys(filter).length > 0) {
      fetchProducts(filter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handlePageChange = (page: number) => {
    updateFilter({ ...filter, page })
  }

  const openCreateModal = useCallback(() => {
    reset(initialProductFormValues)
    setExistingImages([])
    setImageFiles([])
    setImageError(undefined)
    setIsEditMode(false)
    setIsModalOpen(true)
  }, [reset])

  const openEditModal = useCallback((product: Product) => {
    reset({
      name: product.name,
      description: product.description,
      categoryId: product.category._id,
      price: product.price,
      material: product.material || '',
      compatibility: (product.compatibility || []).map((c: unknown) =>
        typeof c === 'string' ? c : (c as { _id: string })._id
      )
    })
    setExistingImages(toImageArray(product.images))
    setImageFiles([])
    setImageError(undefined)
    setIsEditMode(true)
    setIsModalOpen(true)
    selectProduct(product)
  }, [reset, selectProduct])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    reset(initialProductFormValues)
    setExistingImages([])
    setImageFiles([])
    setImageError(undefined)
    selectProduct(null)
  }, [reset, selectProduct])

  const handleSubmitForm = useCallback(async (values: ProductFormData) => {
    // Validate images
    if (existingImages.length === 0 && imageFiles.length === 0) {
      setImageError('Vui lòng tải lên ít nhất một hình ảnh')
      return
    }
    setImageError(undefined)

    try {
      // Upload new images if any
      let uploadedImageIds: string[] = []
      if (imageFiles.length > 0) {
        uploadedImageIds = await uploadImages(imageFiles)
      }

      // Combine existing and new images
      const existingImageIds = existingImages
        .map((img) => toPublicId(img))
        .filter((id): id is string => Boolean(id))

      // Deduplicate to avoid keeping stale duplicated image ids.
      const allImages = Array.from(new Set([...existingImageIds, ...uploadedImageIds]))

      const productData = {
        name: values.name,
        description: values.description,
        categoryId: values.categoryId,
        price: values.price,
        images: allImages,
        material: values.material,
        compatibility: values.compatibility && values.compatibility.length > 0
          ? values.compatibility
          : undefined
      }

      if (isEditMode && selectedProduct) {
        await updateProduct(selectedProduct._id, productData)
        toast.success('Cập nhật sản phẩm thành công')
      } else {
        await createProduct(productData)
        toast.success('Tạo sản phẩm thành công')
      }

      closeModal()
      fetchProducts()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
      toast.error(errorMessage)
    }
  }, [isEditMode, selectedProduct, existingImages, imageFiles, uploadImages, updateProduct, createProduct, closeModal, fetchProducts])

  return (
    <div className="p-2">
      {/* Header */}
      <ProductHeader onCreateClick={openCreateModal} />

      {/* Filters */}
      <ProductFilter
        filter={filter}
        categories={categories}
        onFilterChange={updateFilter}
        onClearFilter={resetFilter}
      />

      <ProductList
        products={products}
        pagination={pagination}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onPageChange={handlePageChange}
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
        isUploadingImages={isUploadingImages}
        control={control}
        categories={categories}
        existingImages={existingImages}
        imageFiles={imageFiles}
        imageError={imageError}
        onClose={closeModal}
        onExistingImagesChange={setExistingImages}
        onImageFilesChange={setImageFiles}
        onSubmit={handleSubmit(handleSubmitForm)}
      />
    </div>
  )
}

export default ProductManagement
