import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import { fetchUsersThunk, updateUserStatusThunk } from '@/features/user/userThunks'
import { setFilter, clearFilter, setSelectedUser, clearError } from '@/features/user/userSlices'
import type { User, UserFilter } from '@/features/user/userTypes'

export const useUserManagement = () => {
  const dispatch = useAppDispatch()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userState = useAppSelector((state: any) => state.user)

  const {
    users = [],
    selectedUser,
    pagination,
    filter = {},
    listLoading = false,
    error,
  } = userState || {}

  const fetchUsers = useCallback(
    async (filterData?: UserFilter) => {
      return dispatch(fetchUsersThunk(filterData))
    },
    [dispatch]
  )

  const updateUserStatus = useCallback(
    async (id: string, isActive: boolean) => {
      return dispatch(updateUserStatusThunk({ id, isActive }))
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
      ...user,
    })),
    [users]
  )

  return {
    users: usersWithDefaults,
    selectedUser,
    pagination,
    filter,
    listLoading,
    error,

    fetchUsers,
    updateUserStatus,
    handleSetFilter,
    handleClearFilter,
    handleSetSelectedUser,
    handleClearError,
  }
}

export default useUserManagement
