import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import { fetchStaffThunk } from '@/features/staff/staffThunks'
import { setFilter, clearFilter, clearError } from '@/features/staff/staffSlice'
import type { UserManageFilter } from '@/features/staff/staffTypes'
import type { RootState } from '@/apps/rootReducer'

export const useStaffManagement = () => {
  const dispatch = useAppDispatch()
  const staffState = useAppSelector((state: RootState) => state.staff)

  const {
    staffList = [],
    pagination,
    filter = {},
    listLoading = false,
    actionLoading = false,
    error
  } = staffState || {}

  const fetchStaff = useCallback(
    async (filterData?: UserManageFilter) => {
      return dispatch(fetchStaffThunk(filterData))
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

  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const staffWithDefaults = useMemo(
    () => staffList.map((user) => ({
      key: user._id,
      ...user
    })),
    [staffList]
  )

  return {
    staff: staffWithDefaults,
    pagination,
    filter,
    listLoading,
    actionLoading,
    error,
    fetchStaff,
    handleSetFilter,
    handleClearFilter,
    handleClearError
  }
}

export default useStaffManagement
