import { useCallback, useEffect, useRef } from 'react'
import { useUserManagement } from '@/hooks/useUserManagement'
import type { UserFilter } from '@/features/user/userTypes'
import { toast } from '@/utils/toast'
import UserHeader from '@/components/user/UserHeader'
import UserFilterComponent from '@/components/user/UserFilter'
import UserListComponent from '@/components/user/UserList'
import type { UserRole } from '@/types/api'

const ManagementUser = () => {
  const {
    users,
    pagination,
    filter,
    listLoading,
    error,
    fetchUsers,
    updateUserStatus,
    handleSetFilter,
    handleClearFilter,
    handleClearError,
  } = useUserManagement()

  const lastFetchParamsRef = useRef<string>('')

  useEffect(() => {
    const filterParams: UserFilter = {
      page: (filter.page as number) || 1,
      limit: (filter.limit as number) || 10,
      search: (filter.search as string) || undefined,
      role: (filter.role as UserRole) || undefined,
      isActive: typeof filter.isActive === 'boolean' ? filter.isActive : undefined,
      sortBy: (filter.sortBy as string) || 'createdAt',
      sortOrder: (filter.sortOrder as 'asc' | 'desc') || 'desc',
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
        page: 1,
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

  return (
    <div className="p-2">
      <UserHeader />

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <UserFilterComponent
        searchValue={(filter.search as string) || ''}
        onSearchChange={handleSearchChange}
        filter={filter}
        onFilterChange={handleFilterChange}
        pagination={{
          page: (filter.page as number) || 1,
          limit: (filter.limit as number) || 10,
          total: pagination?.totalItems || 0,
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
          total: pagination?.totalItems || 0,
        }}
        onUpdateStatus={handleUpdateStatus}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default ManagementUser
