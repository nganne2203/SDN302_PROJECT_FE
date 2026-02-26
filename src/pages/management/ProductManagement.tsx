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
      compatibility: product.compatibility || []
    })
    setExistingImages(product.images)
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
      const existingImageIds = existingImages.map(img =>
        typeof img === 'string' ? img : img.publicId
      )
      const allImages = [...existingImageIds, ...uploadedImageIds]

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
