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
import type { ProductFilter, Product, CreateProductRequest, UpdateProductRequest, Image, UploadedImage } from '@/types/api'
import { uploadApi } from '@/apis/upload'
import { toast } from '@/utils/toast'
import { z } from 'zod'

// Zod validation schema for product form
export const productValidationSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống').max(200, 'Tên sản phẩm không được vượt quá 200 ký tự'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  price: z.number({ error: 'Giá phải là số' }).min(1, 'Giá phải lớn hơn 0'),
  material: z.string().optional(),
  compatibility: z.array(z.string()).optional()
})

export type ProductFormData = z.infer<typeof productValidationSchema>

// Extended form data that includes image fields (not validated by Zod since they are File objects)
export interface ProductFormDataWithImages extends ProductFormData {
  images: (Image | string)[]
  imageFiles: File[]
}

export const initialProductFormValues: ProductFormData = {
  name: '',
  description: '',
  categoryId: '',
  price: 0,
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

  const [isUploadingImages, setIsUploadingImages] = useState(false)

  // Fetch products
  const fetchProducts = useCallback(
    (filterParams?: ProductFilter, forceRefresh = false) => {
      dispatch(fetchProductsThunk({ filter: filterParams || filter, forceRefresh }))
    },
    [dispatch, filter]
  )

  // Fetch product by ID
  const fetchProductById = useCallback(
    (id: string, forceRefresh = false) => {
      dispatch(fetchProductByIdThunk({ id, forceRefresh }))
    },
    [dispatch]
  )

  // Fetch categories
  const fetchCategories = useCallback((forceRefresh = false) => {
    dispatch(fetchCategoriesThunk({ forceRefresh }))
  }, [dispatch])

  // Fetch featured products
  const fetchFeaturedProducts = useCallback((limit?: number, forceRefresh = false) => {
    dispatch(fetchFeaturedProductsThunk({ limit, forceRefresh }))
  }, [dispatch])

  // Fetch new arrivals
  const fetchNewArrivals = useCallback((limit?: number, forceRefresh = false) => {
    dispatch(fetchNewArrivalsThunk({ limit, forceRefresh }))
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

  // Upload images
  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []

    setIsUploadingImages(true)
    try {
      const response = await uploadApi.uploadMultipleImages(files)
      return response.data.map((img: UploadedImage) => img.publicId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error.response.data?.message || 'Không thể tải lên hình ảnh')
    } finally {
      setIsUploadingImages(false)
    }
  }

  // Create product
  const createProduct = useCallback(
    async (data: CreateProductRequest) => {
      return dispatch(createProductThunk(data)).unwrap()
    },
    [dispatch]
  )

  // Update product
  const updateProduct = useCallback(
    async (id: string, data: UpdateProductRequest) => {
      return dispatch(updateProductThunk({ id, data })).unwrap()
    },
    [dispatch]
  )

  // Delete product (only when inactive)
  const handleDelete = async (product: Product) => {
    if (product.isActive) {
      toast.error('Chỉ được xóa sản phẩm đã ngừng hoạt động')
      return
    }

    try {
      await dispatch(deleteProductThunk(product._id)).unwrap()
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
    createProduct,
    updateProduct,
    handleDelete,
    handleToggleStatus,
    handleClearError,
    uploadImages
  }
}
