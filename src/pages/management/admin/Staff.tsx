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

const ManagementStaff = () => {
  const { staff, pagination, filter, listLoading, error, fetchStaff, handleSetFilter, handleClearFilter, handleClearError } =
    useStaffManagement()

  // Reuse updateUserStatus from userManage hook so we can toggle staff status
  const { updateUserStatus, actionLoading } = useUserManagement()

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null)

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

  // Build filter object compatible with UserFilter shape expected by UserFilterComponent
  const staffFilterFields = {
    ...filter,
    isActive: typeof filter.isActive === 'boolean'
      ? filter.isActive
      : ('' as '' | undefined)
  }

  return (
    <div className="p-2">
      <UserHeader title="Quản lý nhân viên" />

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
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        user={selectedStaff}
        onClose={handleCloseDetailModal}
      />
    </div>
  )
}

export default ManagementStaff
