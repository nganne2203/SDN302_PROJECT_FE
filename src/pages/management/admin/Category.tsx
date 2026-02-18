import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCategory, type CategoryFormData, categoryValidationSchema } from '@/hooks/useCategory'
import { toast } from '@/utils/toast'
import type { Category, CategoryFilter } from '@/features/category/categoryTypes'
import CategoryHeader from '../../../components/category/CategoryHeader'
import CategoryFilterComponent from '../../../components/category/CategoryFilter'
import CategoryListComponent from '../../../components/category/CategoryList'
import CategoryModalComponent from '../../../components/category/CategoryModal'

const ManagementCategory = () => {
  const {
    categories,
    pagination,
    filter,
    isLoading,
    error,
    fetchCategories,
    handleSetFilter,
    handleClearFilter,
    handleSetSelectedCategory,
    handleClearError,
    createCategory,
    updateCategory,
    deleteCategory,
    updateCategoryStatus
  } = useCategory()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const lastFetchParamsRef = useRef<string>('')

  const {
    control,
    handleSubmit,
    reset
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryValidationSchema),
    defaultValues: { name: '', description: '' }
  })

  // Fetch categories on mount and when filter changes
  useEffect(() => {
    const filterParams: CategoryFilter = {
      page: (filter.page as number) || 1,
      limit: (filter.limit as number) || 10,
      search: (filter.search as string) || undefined,
      sortBy: (filter.sortBy as string) || 'createdAt',
      sortOrder: (filter.sortOrder as 'asc' | 'desc') || 'desc'
    }
    const paramsKey = JSON.stringify(filterParams)

    // Avoid duplicate fetches (e.g., React Strict Mode double-invoking effects in dev)
    if (lastFetchParamsRef.current === paramsKey) return

    lastFetchParamsRef.current = paramsKey
    fetchCategories(filterParams)
  }, [filter, fetchCategories])

  // Clear error when modal closes
  useEffect(() => {
    if (!isModalOpen && error) {
      handleClearError()
    }
  }, [isModalOpen, error, handleClearError])

  const handleOpenModal = useCallback((category?: Category) => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || ''
      })
      setSelectedCategoryId(category._id)
      handleSetSelectedCategory(category)
      setIsEditMode(true)
    } else {
      reset({ name: '', description: '' })
      setSelectedCategoryId(null)
      handleSetSelectedCategory(null)
      setIsEditMode(false)
    }
    setIsModalOpen(true)
  }, [handleSetSelectedCategory, reset])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    reset({ name: '', description: '' })
    setIsEditMode(false)
    setSelectedCategoryId(null)
    handleSetSelectedCategory(null)
  }, [handleSetSelectedCategory, reset])

  const handleSubmitForm = useCallback(async (values: CategoryFormData) => {
    setIsSubmitting(true)
    try {
      let result
      if (isEditMode && selectedCategoryId) {
        result = await updateCategory(selectedCategoryId, {
          name: values.name,
          description: values.description || undefined
        })
      } else {
        result = await createCategory({
          name: values.name,
          description: values.description || undefined
        })
      }

      if (result.type.includes('fulfilled')) {
        toast.success(isEditMode ? 'Cập nhật danh mục thành công' : 'Tạo danh mục thành công')
        handleCloseModal()
      } else if (result.payload) {
        toast.error(result.payload as string)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [isEditMode, selectedCategoryId, updateCategory, createCategory, handleCloseModal])

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteCategory(id)
    if (result.type.includes('fulfilled')) {
      toast.success('Xóa danh mục thành công')
    } else if (result.payload) {
      toast.error(result.payload as string)
    }
  }, [deleteCategory])

  const handleUpdateStatus = useCallback(async (id: string, isActive: boolean) => {
    const result = await updateCategoryStatus(id, isActive)
    if (result.type.includes('fulfilled')) {
      toast.success('Cập nhật trạng thái danh mục thành công')
    } else if (result.payload) {
      toast.error(result.payload as string)
    }
  }, [updateCategoryStatus])
  return (
    <div className='p-2'>
      <CategoryHeader onAddClick={() => handleOpenModal()} />

      <CategoryFilterComponent
        searchValue={(filter.search as string) || ''}
        onSearchChange={(value) => handleSetFilter({ search: value, page: 1 })}
        filter={filter}
        onFilterChange={(key, value) => handleSetFilter({ [key]: value, page: 1 })}
        onPageChange={(page, pageSize) => handleSetFilter({ page, limit: pageSize })}
        onReset={handleClearFilter}
      />

      <CategoryListComponent
        categories={categories}
        isLoading={isLoading}
        pagination={{
          page: (filter.page as number) || 1,
          limit: (filter.limit as number) || 10,
          total: pagination?.totalItems || 0
        }}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        onUpdateStatus={handleUpdateStatus}
        onPageChange={(page, pageSize) => handleSetFilter({ page, limit: pageSize })}
      />

      <CategoryModalComponent
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
        control={control}
        onClose={handleCloseModal}
        onSubmit={handleSubmit(handleSubmitForm)}
      />
    </div>
  )
}

export default ManagementCategory