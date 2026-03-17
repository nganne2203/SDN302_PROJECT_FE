import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from '@/utils/toast'
import useBranch, { type BranchFormData } from '@/hooks/useBranch'
import type { Branch, BranchFilter } from '@/features/branch/branchTypes'
import { USER_ROLES, STORAGE_KEYS } from '@/constants/constant'
import { getStorage } from '@/utils/storage'
import BranchHeader from '@/components/branch/BranchHeader'
import BranchFilterComponent from '@/components/branch/BranchFilter'
import BranchListComponent from '@/components/branch/BranchList'
import BranchModalComponent from '@/components/branch/BranchModal'

const BranchesManagement = () => {
  const {
    branches,
    pagination,
    filter,
    isLoading,
    error,
    fetchBranches,
    createBranch,
    updateBranch,
    updateBranchStatus,
    handleSetFilter,
    handleClearFilter,
    handleSetSelectedBranch,
    handleClearError,
    validateBranchForm,
    deleteBranch
  } = useBranch()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    address: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const lastFetchParamsRef = useRef<string>('')

  const currentUserRaw = getStorage(STORAGE_KEYS.USER_INFO)
  const currentUserRole = currentUserRaw
    ? (JSON.parse(currentUserRaw)?.role as string | undefined)
    : undefined
  const canManage = currentUserRole === USER_ROLES.ADMIN

  // Fetch branches on mount and when filter changes
  useEffect(() => {
    const filterParams: BranchFilter = {
      page: (filter.page as number) || 1,
      limit: (filter.limit as number) || 10,
      search: (filter.search as string) || undefined,
      isActive: typeof filter.isActive === 'boolean' ? filter.isActive : undefined,
      sortBy: (filter.sortBy as string) || 'createdAt',
      sortOrder: (filter.sortOrder as 'asc' | 'desc') || 'desc'
    }

    const paramsKey = JSON.stringify(filterParams)
    if (lastFetchParamsRef.current === paramsKey) return

    lastFetchParamsRef.current = paramsKey
    fetchBranches(filterParams, true)
  }, [filter, fetchBranches])

  // Clear error when modal closes
  useEffect(() => {
    if (!isModalOpen && error) {
      handleClearError()
    }
  }, [isModalOpen, error, handleClearError])

  const handleOpenModal = useCallback(
    (branch?: Branch) => {
      if (branch) {
        setFormData({
          name: branch.name,
          address: branch.address
        })
        setSelectedBranchId(branch._id)
        handleSetSelectedBranch(branch)
        setIsEditMode(true)
      } else {
        setFormData({ name: '', address: '' })
        setSelectedBranchId(null)
        handleSetSelectedBranch(null)
        setIsEditMode(false)
      }
      setIsModalOpen(true)
    },
    [handleSetSelectedBranch]
  )

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setFormData({ name: '', address: '' })
    setIsEditMode(false)
    setSelectedBranchId(null)
    handleSetSelectedBranch(null)
  }, [handleSetSelectedBranch])

  const handleSubmit = useCallback(async (data: { name: string; address: string }) => {
    if (!canManage) {
      toast.error('Bạn không có quyền thao tác chi nhánh')
      return
    }

    const validation = validateBranchForm(data as unknown as Record<string, unknown>)
    if (!validation.valid) {
      toast.error('Dữ liệu không hợp lệ')
      return
    }

    setIsSubmitting(true)
    try {
      let result
      if (isEditMode && selectedBranchId) {
        result = await updateBranch(selectedBranchId, {
          name: data.name,
          address: data.address
        })
      } else {
        result = await createBranch({
          name: data.name,
          address: data.address
        })
      }

      if (result.type.includes('fulfilled')) {
        toast.success(isEditMode ? 'Cập nhật chi nhánh thành công' : 'Tạo chi nhánh thành công')
        handleCloseModal()
      } else if (result.payload) {
        toast.error(result.payload as string)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [
    canManage,
    createBranch,
    handleCloseModal,
    isEditMode,
    selectedBranchId,
    updateBranch,
    validateBranchForm
  ])

  const handleUpdateStatus = useCallback(
    async (id: string, isActive: boolean) => {
      if (!canManage) {
        toast.error('Bạn không có quyền thao tác chi nhánh')
        return
      }

      const result = await updateBranchStatus(id, isActive)
      if (result.type.includes('fulfilled')) {
        toast.success('Cập nhật trạng thái chi nhánh thành công')
      } else if (result.payload) {
        toast.error(result.payload as string)
      }
    },
    [canManage, updateBranchStatus]
  )

  const handleFilterChange = useCallback(
    (key: string, value: unknown) => {
      if (key === 'isActive') {
        if (value === '' || value === null || value === undefined) {
          handleSetFilter({ isActive: undefined, page: 1 })
          return
        }
        const isActiveValue = value === 'true' ? true : value === 'false' ? false : undefined
        handleSetFilter({ isActive: isActiveValue, page: 1 })
        return
      }

      if (key === 'sort') {
        const sortData = value as { field?: string; order?: 'asc' | 'desc' | '' }
        handleSetFilter({
          sortBy: sortData.field || 'createdAt',
          sortOrder: (sortData.order as 'asc' | 'desc') || 'desc',
          page: 1
        })
        return
      }

      handleSetFilter({ [key]: value, page: 1 })
    },
    [handleSetFilter]
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      handleSetFilter({ search: value, page: 1 })
    },
    [handleSetFilter]
  )

  const handlePageChange = useCallback(
    (page: number, pageSize: number) => {
      handleSetFilter({ page, limit: pageSize })
    },
    [handleSetFilter]
  )

  const handleDeleteBranch = useCallback(
    async (id: string) => {
      if (!canManage) {
        toast.error('Bạn không có quyền thao tác chi nhánh')
        return
      }

      const result = await deleteBranch(id)
      if (result.type.includes('fulfilled')) {
        toast.success('Xóa chi nhánh thành công')
      } else if (result.payload) {
        toast.error(result.payload as string)
      }
    },
    [canManage, deleteBranch]
  )

  return (
    <div className="p-2">
      <BranchHeader onAddClick={() => handleOpenModal()} canManage={canManage} />

      <BranchFilterComponent
        searchValue={(filter.search as string) || ''}
        onSearchChange={handleSearchChange}
        filter={filter}
        onFilterChange={handleFilterChange}
        pagination={{
          page: (filter.page as number) || 1,
          limit: (filter.limit as number) || 10,
          total: pagination?.totalItems || 0
        }}
        onPageChange={handlePageChange}
        onReset={handleClearFilter}
      />

      <BranchListComponent
        branches={branches as unknown as Branch[]}
        isLoading={isLoading}
        canManage={canManage}
        pagination={{
          page: (filter.page as number) || 1,
          limit: (filter.limit as number) || 10,
          total: pagination?.totalItems || 0
        }}
        onEdit={handleOpenModal}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDeleteBranch}
        onPageChange={handlePageChange}
      />

      <BranchModalComponent
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        canManage={canManage}
        initialData={isEditMode && selectedBranchId ? formData : undefined}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default BranchesManagement