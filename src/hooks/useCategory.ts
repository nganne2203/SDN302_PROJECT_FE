import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import {
  fetchCategoriesThunk,
  fetchCategoryByIdThunk,
  createCategoryThunk,
  updateCategoryThunk,
  deleteCategoryThunk,
  updateCategoryStatusThunk
} from '@/features/category/categoryThunks'
import {
  setFilter,
  clearFilter,
  setSelectedCategory,
  clearError
} from '@/features/category/categorySlices'
import type { Category, CategoryFilter, CreateCategoryPayload } from '@/features/category/categoryTypes'
import { z } from 'zod'

// Validation schema
const categoryValidationSchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống').max(100, 'Tên danh mục không được vượt quá 100 ký tự'),
  description: z.string().max(500, 'Mô tả không được vượt quá 500 ký tự').optional().or(z.literal(''))
})

export type CategoryFormData = z.infer<typeof categoryValidationSchema>

export const useCategory = () => {
  const dispatch = useAppDispatch()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryState = useAppSelector((state: any) => state.category)

  const {
    categories = [],
    selectedCategory,
    pagination,
    filter = {},
    isLoading = false,
    error
  } = categoryState || {}

  const fetchCategories = useCallback(
    async (filterData?: CategoryFilter) => {
      return dispatch(fetchCategoriesThunk(filterData))
    },
    [dispatch]
  )

  const fetchCategoryById = useCallback(
    async (id: string) => {
      return dispatch(fetchCategoryByIdThunk(id))
    },
    [dispatch]
  )

  const createCategory = useCallback(
    async (data: CreateCategoryPayload) => {
      return dispatch(createCategoryThunk(data))
    },
    [dispatch]
  )

  const updateCategory = useCallback(
    async (id: string, data: CreateCategoryPayload) => {
      return dispatch(updateCategoryThunk({ id, data }))
    },
    [dispatch]
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      return dispatch(deleteCategoryThunk(id))
    },
    [dispatch]
  )

  const updateCategoryStatus = useCallback(
    async (id: string, isActive: boolean) => {
      return dispatch(updateCategoryStatusThunk({ id, isActive }))
    },
    [dispatch]
  )

  const handleSetFilter = useCallback(
    (newFilter: Record<string, unknown>) => {
      dispatch(setFilter(newFilter))
    },
    [dispatch]
  )

  const handleClearFilter = useCallback(() => {
    dispatch(clearFilter())
  }, [dispatch])

  const handleSetSelectedCategory = useCallback(
    (category: Category | null) => {
      dispatch(setSelectedCategory(category))
    },
    [dispatch]
  )

  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const validateCategoryForm = useCallback((data: Record<string, unknown>) => {
    try {
      const validated = categoryValidationSchema.parse(data)
      return { valid: true, data: validated, errors: {} }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        err.issues.forEach((issue) => {
          const path = issue.path.join('.')
          errors[path] = issue.message
        })
        return { valid: false, data: null, errors }
      }
      return { valid: false, data: null, errors: { general: 'Lỗi xác thực' } }
    }
  }, [])

  const categoriesWithDefaults = useMemo(() => categories.map((cat: Category) => ({
    key: cat._id,
    ...cat
  })), [categories])

  return {
    // State
    categories: categoriesWithDefaults,
    selectedCategory,
    pagination,
    filter,
    isLoading,
    error,
    updateCategoryStatus,

    // Actions
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    handleSetFilter,
    handleClearFilter,
    handleSetSelectedCategory,
    handleClearError,

    // Validation
    validateCategoryForm
  }
}

export default useCategory
