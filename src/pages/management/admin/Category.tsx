import { useState, useEffect, useCallback, useRef } from 'react'
import { useCategory, type CategoryFormData } from '@/hooks/useCategory'
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
    updateCategoryStatus,
    validateCategoryForm
  } = useCategory()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', description: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const lastFetchParamsRef = useRef<string>('')

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
      setFormData({
        name: category.name,
        description: category.description || ''
      })
      setSelectedCategoryId(category._id)
      handleSetSelectedCategory(category)
      setIsEditMode(true)
    } else {
      setFormData({ name: '', description: '' })
      setSelectedCategoryId(null)
      handleSetSelectedCategory(null)
      setIsEditMode(false)
    }
    setFormErrors({})
    setIsModalOpen(true)
  }, [handleSetSelectedCategory])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setFormData({ name: '', description: '' })
    setFormErrors({})
    setIsEditMode(false)
    setSelectedCategoryId(null)
    handleSetSelectedCategory(null)
  }, [handleSetSelectedCategory])

  const handleFormChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [formErrors])

  const handleSubmit = useCallback(async () => {
    const validation = validateCategoryForm(formData)
    if (!validation.valid) {
      setFormErrors(validation.errors)
      return
    }

    setIsSubmitting(true)
    try {
      let result
      if (isEditMode && selectedCategoryId) {
        result = await updateCategory(selectedCategoryId, {
          name: formData.name,
          description: formData.description || undefined
        })
      } else {
        result = await createCategory({
          name: formData.name,
          description: formData.description || undefined
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
  }, [formData, isEditMode, selectedCategoryId, validateCategoryForm, updateCategory, createCategory, handleCloseModal])

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

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

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
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default ManagementCategory