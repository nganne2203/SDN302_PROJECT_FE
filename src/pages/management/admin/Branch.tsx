import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from '@/utils/toast'
import useBranch, { type BranchFormData } from '@/hooks/useBranch'
import type { Branch, BranchFilter } from '@/features/branch/branchTypes'
import { userManageApi } from '@/apis/userManage'
import { USER_ROLES, STORAGE_KEYS } from '@/constants/constant'
import { getStorage } from '@/utils/storage'
import type { User } from '@/features/user/userTypes'
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
    validateBranchForm
  } = useBranch()

  const [managers, setManagers] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    address: '',
    manager: null
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const lastFetchParamsRef = useRef<string>('')

  const currentUserRaw = getStorage(STORAGE_KEYS.USER_INFO)
  const currentUserRole = currentUserRaw
    ? (JSON.parse(currentUserRaw)?.role as string | undefined)
    : undefined
  const canManage = currentUserRole === USER_ROLES.ADMIN

  // Fetch managers for assign-manager dropdown
  useEffect(() => {
    const loadManagers = async () => {
      try {
        const res = await userManageApi.getUsers({ page: 1, limit: 200, role: USER_ROLES.MANAGER })
        setManagers(res.data)
      } catch {
        // ignore
      }
    }
    loadManagers()
  }, [])

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
    fetchBranches(filterParams)
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
          address: branch.address,
          manager: branch.manager || null
        })
        setSelectedBranchId(branch._id)
        handleSetSelectedBranch(branch)
        setIsEditMode(true)
      } else {
        setFormData({ name: '', address: '', manager: null })
        setSelectedBranchId(null)
        handleSetSelectedBranch(null)
        setIsEditMode(false)
      }
      setFormErrors({})
      setIsModalOpen(true)
    },
    [handleSetSelectedBranch]
  )

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setFormData({ name: '', address: '', manager: null })
    setFormErrors({})
    setIsEditMode(false)
    setSelectedBranchId(null)
    handleSetSelectedBranch(null)
  }, [handleSetSelectedBranch])

  const handleFormChange = useCallback(
    (field: keyof BranchFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (formErrors[field as string]) {
        setFormErrors((prev) => {
          const next = { ...prev }
          delete next[field as string]
          return next
        })
      }
    },
    [formErrors]
  )

  const handleManagerChange = useCallback((managerId: string | null) => {
    setFormData((prev) => ({ ...prev, manager: managerId }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!canManage) {
      toast.error('Bạn không có quyền thao tác chi nhánh')
      return
    }

    const validation = validateBranchForm(formData as unknown as Record<string, unknown>)
    if (!validation.valid) {
      setFormErrors(validation.errors)
      return
    }

    setIsSubmitting(true)
    try {
      let result
      if (isEditMode && selectedBranchId) {
        result = await updateBranch(selectedBranchId, {
          name: formData.name,
          address: formData.address,
          manager: formData.manager || null
        })
      } else {
        result = await createBranch({
          name: formData.name,
          address: formData.address,
          manager: formData.manager || null
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
    formData,
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

  return (
    <div className="p-2">
      <BranchHeader onAddClick={() => handleOpenModal()} canManage={canManage} />

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

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
        managers={managers}
        isLoading={isLoading}
        canManage={canManage}
        pagination={{
          page: (filter.page as number) || 1,
          limit: (filter.limit as number) || 10,
          total: pagination?.totalItems || 0
        }}
        onEdit={handleOpenModal}
        onUpdateStatus={handleUpdateStatus}
        onPageChange={handlePageChange}
      />

      <BranchModalComponent
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        canManage={canManage}
        managers={managers}
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onFormChange={handleFormChange}
        onManagerChange={handleManagerChange}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default BranchesManagement