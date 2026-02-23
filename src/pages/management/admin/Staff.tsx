import { useCallback, useEffect, useRef } from 'react'
import { useStaffManagement } from '@/hooks/useStaffManagement'
import type { UserManageFilter, UserRole } from '@/types/api'
import UserHeader from '@/components/user/UserHeader'
import UserFilterComponent from '@/components/user/UserFilter'
import UserListComponent from '@/components/user/UserList'
import type { User } from '@/features/user/userTypes'
import { toast } from '@/utils/toast'
import { useUserManagement } from '@/hooks/useUserManagement'
import UserDetailModal from '@/components/user/UserDetailModal'
import { useState } from 'react'
import UserFormModal from '@/components/user/UserFormModal'
import { stripLocationCodesFromList } from '@/utils/address'
import { USER_ROLES } from '@/constants/constant'

const ManagementStaff = () => {
  const { staff, pagination, filter, listLoading, error, fetchStaff, handleSetFilter, handleClearFilter, handleClearError } =
    useStaffManagement()

  // Reuse create/update/status actions from userManage hook
  const { updateUserStatus, actionLoading, createUser, updateUser, getUserById } = useUserManagement()

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const lastFetchParamsRef = useRef<string>('')

  useEffect(() => {
    const filterParams: UserManageFilter = {
      page: (filter.page as number) || 1,
      limit: (filter.limit as number) || 10,
      search: (filter.search as string) || undefined,
      role: (filter.role as UserRole) || undefined,
      isActive: typeof filter.isActive === 'boolean' ? filter.isActive : undefined,
      sortBy: (filter.sortBy as string) || 'createdAt',
      sortOrder: (filter.sortOrder as 'asc' | 'desc') || 'desc'
    }

    const paramsKey = JSON.stringify(filterParams)
    if (lastFetchParamsRef.current === paramsKey) return
    lastFetchParamsRef.current = paramsKey
    fetchStaff(filterParams)
  }, [filter, fetchStaff])

  useEffect(() => {
    if (error) {
      return () => handleClearError()
    }
  }, [error, handleClearError])

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
      if (key === 'role') {
        handleSetFilter({ role: value === '' ? undefined : value, page: 1 })
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

  const handleUpdateStatus = useCallback(
    async (id: string, isActive: boolean) => {
      const result = await updateUserStatus(id, isActive)
      if (result.type.includes('fulfilled')) {
        toast.success('Cập nhật trạng thái nhân viên thành công')
        fetchStaff(filter as UserManageFilter)
      } else if (result.payload) {
        toast.error(result.payload as string)
      }
    },
    [updateUserStatus, fetchStaff, filter]
  )

  const handleViewStaff = useCallback((user: User) => {
    setSelectedStaff(user)
    setIsDetailModalOpen(true)
  }, [])

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false)
    setSelectedStaff(null)
  }, [])

  const handleCreateStaff = useCallback(() => {
    setIsEditMode(false)
    setSelectedStaff(null)
    setIsFormModalOpen(true)
  }, [])

  const handleEditStaff = useCallback(async (user: User) => {
    try {
      const result = await getUserById(user._id)
      if (result.type.includes('fulfilled')) {
        setIsEditMode(true)
        setSelectedStaff(result.payload as User)
        setIsFormModalOpen(true)
      } else {
        toast.error('Không thể tải thông tin nhân viên')
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi tải thông tin nhân viên')
    }
  }, [getUserById])

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false)
    setSelectedStaff(null)
    setIsEditMode(false)
  }, [])

  const handleEditFromDetail = useCallback((user: User) => {
    setIsDetailModalOpen(false)
    handleEditStaff(user)
  }, [handleEditStaff])

  const handleFormSubmit = useCallback(async (formData: {
    fullname: string
    email: string
    password: string
    phone: string
    role: UserRole
    branch: string
    avatar: string
    addresses: Array<{
      fullname: string
      phone: string
      addressLine: string
      city: string
      district: string
      ward: string
      isDefault: boolean
    }>
  }) => {
    try {
      const sanitizedAddresses = formData.addresses.length > 0
        ? stripLocationCodesFromList(formData.addresses)
        : undefined

      if (isEditMode && selectedStaff) {
        const result = await updateUser(selectedStaff._id, {
          fullname: formData.fullname,
          email: formData.email,
          phone: formData.phone || undefined,
          role: formData.role,
          branch: formData.branch || undefined,
          avatar: formData.avatar || undefined,
          addresses: sanitizedAddresses
        })

        if (result.type.includes('fulfilled')) {
          toast.success('Cập nhật nhân viên thành công')
          handleCloseFormModal()
          fetchStaff(filter as UserManageFilter)
        } else if (result.payload) {
          toast.error(result.payload as string)
        }
      } else {
        const result = await createUser({
          fullname: formData.fullname,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          role: formData.role,
          branch: formData.branch || undefined,
          avatar: formData.avatar || undefined,
          addresses: sanitizedAddresses
        })

        if (result.type.includes('fulfilled')) {
          toast.success('Tạo nhân viên thành công')
          handleCloseFormModal()
          fetchStaff(filter as UserManageFilter)
        } else if (result.payload) {
          toast.error(result.payload as string)
        }
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi xử lý yêu cầu')
    }
  }, [isEditMode, selectedStaff, updateUser, createUser, handleCloseFormModal, fetchStaff, filter])

  // Build filter object compatible with UserFilter shape expected by UserFilterComponent
  const staffFilterFields = {
    ...filter,
    isActive: typeof filter.isActive === 'boolean'
      ? filter.isActive
      : ('' as '' | undefined)
  }

  return (
    <div className="p-2">
      <UserHeader title="Quản lý nhân viên" onCreateUser={handleCreateStaff} />

      <UserFilterComponent
        searchValue={(filter.search as string) || ''}
        onSearchChange={handleSearchChange}
        filter={staffFilterFields}
        onFilterChange={handleFilterChange}
        pagination={{
          page: (filter.page as number) || 1,
          limit: (filter.limit as number) || 10,
          total: pagination?.totalItems || 0
        }}
        onPageChange={handlePageChange}
        onReset={handleClearFilter}
      />

      <UserListComponent
        users={staff as unknown as User[]}
        isLoading={listLoading || actionLoading}
        pagination={{
          page: (filter.page as number) || 1,
          limit: (filter.limit as number) || 10,
          total: pagination?.totalItems || 0
        }}
        onUpdateStatus={handleUpdateStatus}
        onPageChange={handlePageChange}
        onViewUser={handleViewStaff}
        onEditUser={handleEditStaff}
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        user={selectedStaff}
        onClose={handleCloseDetailModal}
        onEdit={handleEditFromDetail}
      />

      <UserFormModal
        isOpen={isFormModalOpen}
        isEditMode={isEditMode}
        user={selectedStaff}
        isSubmitting={actionLoading}
        defaultRole={USER_ROLES.STAFF as UserRole}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}

export default ManagementStaff
