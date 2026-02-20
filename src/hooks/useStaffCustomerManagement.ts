import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import {
  fetchCustomersThunk,
  createUserThunk,
  getUserByIdThunk,
  updateUserThunk
} from '@/features/userManage/userManageThunks'
import { setFilter, clearFilter, setSelectedUser, clearError } from '@/features/userManage/userManageSlices'
import type { User, UserManageFilter } from '@/features/userManage/userManageTypes'
import type { CreateUserRequest, UpdateUserRequest } from '@/types/api'

export const useStaffCustomerManagement = () => {
  const dispatch = useAppDispatch()
  const userManageState = useAppSelector((state) => state.userManage)

  const {
    users = [],
    selectedUser,
    pagination,
    filter = {},
    listLoading = false,
    actionLoading = false,
    error
  } = userManageState || {}

  const fetchCustomers = useCallback(
    async (filterData?: UserManageFilter) => {
      return dispatch(fetchCustomersThunk(filterData))
    },
    [dispatch]
  )

  const createUser = useCallback(
    async (data: CreateUserRequest) => {
      return dispatch(createUserThunk(data))
    },
    [dispatch]
  )

  const getUserById = useCallback(
    async (id: string) => {
      return dispatch(getUserByIdThunk(id))
    },
    [dispatch]
  )

  const updateUser = useCallback(
    async (id: string, data: UpdateUserRequest) => {
      return dispatch(updateUserThunk({ id, data }))
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

  const handleSetSelectedUser = useCallback(
    (user: User | null) => {
      dispatch(setSelectedUser(user))
    },
    [dispatch]
  )

  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const usersWithDefaults = useMemo(
    () => users.map((user: User) => ({
      key: user._id,
      ...user
    })),
    [users]
  )

  return {
    users: usersWithDefaults,
    selectedUser,
    pagination,
    filter,
    listLoading,
    actionLoading,
    error,
    fetchCustomers,
    createUser,
    getUserById,
    updateUser,
    handleSetFilter,
    handleClearFilter,
    handleSetSelectedUser,
    handleClearError
  }
}

export default useStaffCustomerManagement
