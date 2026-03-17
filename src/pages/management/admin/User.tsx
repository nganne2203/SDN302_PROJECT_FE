import { useCallback, useEffect, useRef, useState } from 'react'
import { useUserManagement } from '@/hooks/useUserManagement'
import type { UserManageFilter } from '@/types/api'
import { toast } from '@/utils/toast'
import UserHeader from '@/components/user/UserHeader'
import UserFilterComponent from '@/components/user/UserFilter'
import UserListComponent from '@/components/user/UserList'
import UserFormModal from '@/components/user/UserFormModal'
import UserDetailModal from '@/components/user/UserDetailModal'
import { stripLocationCodesFromList } from '@/utils/address'
import { getChangedEmailField } from '@/utils/userUpdate'
import type { UserRole } from '@/types/api'
import type { User } from '@/features/user/userTypes'

const ManagementUser = () => {
  const {
    users,
    pagination,
    filter,
    listLoading,
    actionLoading,
    error,
    fetchUsers,
    createUser,
    getUserById,
    updateUser,
    updateUserStatus,
    handleSetFilter,
    handleClearFilter,
    handleClearError
  } = useUserManagement()

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

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
    fetchUsers(filterParams)
  }, [filter, fetchUsers])

  useEffect(() => {
    if (error) {
      // Clear error when user navigates away from the page interactions
      return () => handleClearError()
    }
  }, [error, handleClearError])

  const handleFilterChange = useCallback((key: string, value: unknown) => {
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
      const roleValue = value === '' ? undefined : value
      handleSetFilter({ role: roleValue, page: 1 })
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
  }, [handleSetFilter])

  const handleSearchChange = useCallback((value: string) => {
    handleSetFilter({ search: value, page: 1 })
  }, [handleSetFilter])

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    handleSetFilter({ page, limit: pageSize })
  }, [handleSetFilter])

  const handleUpdateStatus = useCallback(async (id: string, isActive: boolean) => {
    const result = await updateUserStatus(id, isActive)
    if (result.type.includes('fulfilled')) {
      toast.success('Cập nhật trạng thái người dùng thành công')
    } else if (result.payload) {
      toast.error(result.payload as string)
    }
  }, [updateUserStatus])

  const handleCreateUser = useCallback(() => {
    setIsEditMode(false)
    setSelectedUser(null)
    setIsFormModalOpen(true)
  }, [])

  const handleEditUser = useCallback(async (user: User) => {
    // Fetch fresh user data to ensure we have all details including addresses
    try {
      const result = await getUserById(user._id)
      if (result.type.includes('fulfilled')) {
        setIsEditMode(true)
        setSelectedUser(result.payload as User)
        setIsFormModalOpen(true)
      } else {
        toast.error('Không thể tải thông tin người dùng')
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi tải thông tin người dùng')
    }
  }, [getUserById])

  const handleViewUser = useCallback((user: User) => {
    setSelectedUser(user)
    setIsDetailModalOpen(true)
  }, [])

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
      if (isEditMode && selectedUser) {
        const result = await updateUser(selectedUser._id, {
          fullname: formData.fullname,
          ...getChangedEmailField(selectedUser, formData.email),
          phone: formData.phone || undefined,
          role: formData.role,
          branch: formData.branch || undefined,
          avatar: formData.avatar || undefined,
          addresses: sanitizedAddresses
        })

        if (result.type.includes('fulfilled')) {
          toast.success('Cập nhật người dùng thành công')
          setIsFormModalOpen(false)
          setSelectedUser(null)
          fetchUsers(filter as UserManageFilter)
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
          toast.success('Tạo người dùng thành công')
          setIsFormModalOpen(false)
          fetchUsers(filter as UserManageFilter)
        } else if (result.payload) {
          toast.error(result.payload as string)
        }
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi xử lý yêu cầu')
    }
  }, [isEditMode, selectedUser, createUser, updateUser, fetchUsers, filter])

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false)
    setSelectedUser(null)
    setIsEditMode(false)
  }, [])

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false)
    setSelectedUser(null)
  }, [])

  const handleEditFromDetail = useCallback((user: User) => {
    setIsDetailModalOpen(false)
    handleEditUser(user)
  }, [handleEditUser])

  return (
    <div className="p-2">
      <UserHeader onCreateUser={handleCreateUser} />

      <UserFilterComponent
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

      <UserListComponent
        users={users}
        isLoading={listLoading}
        pagination={{
          page: (filter.page as number) || 1,
          limit: (filter.limit as number) || 10,
          total: pagination?.totalItems || 0
        }}
        onUpdateStatus={handleUpdateStatus}
        onPageChange={handlePageChange}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
      />

      <UserFormModal
        isOpen={isFormModalOpen}
        isEditMode={isEditMode}
        user={selectedUser}
        isSubmitting={actionLoading}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        user={selectedUser}
        onClose={handleCloseDetailModal}
        onEdit={handleEditFromDetail}
      />
    </div>
  )
}

export default ManagementUser
