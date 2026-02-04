import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import {
  fetchProductsThunk,
  fetchProductByIdThunk,
  fetchCategoriesThunk,
  createProductThunk,
  updateProductThunk,
  deleteProductThunk,
  updateProductStatusThunk,
  fetchFeaturedProductsThunk,
  fetchNewArrivalsThunk,
  fetchRelatedProductsThunk,
  searchProductsThunk
} from '@/features/product/productThunks'
import {
  setFilter,
  clearFilter,
  setSelectedProduct,
  clearError,
  clearProducts
} from '@/features/product/productSlices'
import type { ProductFilter, Product, CreateProductRequest, UpdateProductRequest } from '@/types/api'
import { uploadApi } from '@/apis/upload'
import { toast } from '@/utils/toast'

export interface ProductFormData {
  name: string
  description: string
  categoryId: string
  price: number
  images: string[]
  imageFiles: File[]
  material?: string
  compatibility?: string[]
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  categoryId: '',
  price: 0,
  images: [],
  imageFiles: [],
  material: '',
  compatibility: []
}

export const useProduct = () => {
  const dispatch = useAppDispatch()
  const {
    products,
    selectedProduct,
    filter,
    pagination,
    categories,
    featuredProducts,
    newArrivals,
    relatedProducts,
    isLoading,
    isSubmitting,
    error
  } = useAppSelector((state) => state.product)

  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  // Fetch products
  const fetchProducts = useCallback(
    (filterParams?: ProductFilter) => {
      dispatch(fetchProductsThunk(filterParams || filter))
    },
    [dispatch, filter]
  )

  // Fetch product by ID
  const fetchProductById = useCallback(
    (id: string) => {
      dispatch(fetchProductByIdThunk(id))
    },
    [dispatch]
  )

  // Fetch categories
  const fetchCategories = useCallback(() => {
    dispatch(fetchCategoriesThunk())
  }, [dispatch])

  // Fetch featured products
  const fetchFeaturedProducts = useCallback((limit?: number) => {
    dispatch(fetchFeaturedProductsThunk(limit))
  }, [dispatch])

  // Fetch new arrivals
  const fetchNewArrivals = useCallback((limit?: number) => {
    dispatch(fetchNewArrivalsThunk(limit))
  }, [dispatch])

  // Fetch related products
  const fetchRelatedProducts = useCallback((id: string, limit?: number) => {
    dispatch(fetchRelatedProductsThunk({ id, limit }))
  }, [dispatch])

  // Search products
  const searchProducts = useCallback((query: string, filterParams?: ProductFilter) => {
    dispatch(searchProductsThunk({ query, filter: filterParams }))
  }, [dispatch])

  // Update filter
  const updateFilter = useCallback(
    (newFilter: ProductFilter) => {
      dispatch(setFilter(newFilter))
    },
    [dispatch]
  )

  // Reset filter
  const resetFilter = useCallback(() => {
    dispatch(clearFilter())
  }, [dispatch])

  // Select product
  const selectProduct = useCallback(
    (product: Product | null) => {
      dispatch(setSelectedProduct(product))
    },
    [dispatch]
  )

  // Clear products
  const clearProductsList = useCallback(() => {
    dispatch(clearProducts())
  }, [dispatch])

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Tên sản phẩm không được để trống'
    }

    if (!formData.description.trim()) {
      errors.description = 'Mô tả không được để trống'
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Vui lòng chọn danh mục'
    }

    if (formData.price <= 0) {
      errors.price = 'Giá phải lớn hơn 0'
    }

    if (formData.images.length === 0 && formData.imageFiles.length === 0) {
      errors.images = 'Vui lòng tải lên ít nhất một hình ảnh'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Upload images
  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []

    setIsUploadingImages(true)
    try {
      const response = await uploadApi.uploadMultipleImages(files)
      return response.data.publicIds
    } catch (error) {
      toast.error('Không thể tải lên hình ảnh')
      throw error
    } finally {
      setIsUploadingImages(false)
    }
  }

  // Handle form change
  const handleFormChange = (field: keyof ProductFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Open create modal
  const openCreateModal = () => {
    setFormData(initialFormData)
    setFormErrors({})
    setIsEditMode(false)
    setIsModalOpen(true)
  }

  // Open edit modal
  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      categoryId: product.category._id,
      price: product.price,
      images: product.images,
      imageFiles: [],
      material: product.material || '',
      compatibility: product.compatibility || []
    })
    setFormErrors({})
    setIsEditMode(true)
    setIsModalOpen(true)
    dispatch(setSelectedProduct(product))
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setFormData(initialFormData)
    setFormErrors({})
    dispatch(setSelectedProduct(null))
  }

  // Handle submit (create or update)
  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      // Upload new images if any
      let uploadedImageIds: string[] = []
      if (formData.imageFiles.length > 0) {
        uploadedImageIds = await uploadImages(formData.imageFiles)
      }

      // Combine existing and new images
      const allImages = [...formData.images, ...uploadedImageIds]

      const productData: CreateProductRequest | UpdateProductRequest = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        price: formData.price,
        images: allImages,
        material: formData.material,
        compatibility: formData.compatibility && formData.compatibility.length > 0
          ? formData.compatibility
          : undefined
      }

      if (isEditMode && selectedProduct) {
        await dispatch(updateProductThunk({
          id: selectedProduct._id,
          data: productData
        })).unwrap()
        toast.success('Cập nhật sản phẩm thành công')
      } else {
        await dispatch(createProductThunk(productData as CreateProductRequest)).unwrap()
        toast.success('Tạo sản phẩm thành công')
      }

      closeModal()
      fetchProducts()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
      toast.error(errorMessage)
    }
  }

  // Delete product
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteProductThunk(id)).unwrap()
      toast.success('Xóa sản phẩm thành công')
      fetchProducts()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể xóa sản phẩm'
      toast.error(errorMessage)
    }
  }

  // Toggle product status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await dispatch(updateProductStatusThunk({
        id,
        data: { isActive: !currentStatus }
      })).unwrap()
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái'
      toast.error(errorMessage)
    }
  }

  // Clear error
  const handleClearError = () => {
    dispatch(clearError())
  }

  return {
    // State
    products,
    selectedProduct,
    filter,
    pagination,
    categories,
    featuredProducts,
    newArrivals,
    relatedProducts,
    isLoading,
    isSubmitting,
    error,
    formData,
    formErrors,
    isModalOpen,
    isEditMode,
    isUploadingImages,

    // Actions
    fetchProducts,
    fetchProductById,
    fetchCategories,
    fetchFeaturedProducts,
    fetchNewArrivals,
    fetchRelatedProducts,
    searchProducts,
    updateFilter,
    resetFilter,
    selectProduct,
    clearProductsList,
    handleFormChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
    handleToggleStatus,
    handleClearError,
    uploadImages
  }
}
