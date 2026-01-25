import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/apps/store'
import type { RootState } from '@/apps/rootReducer'
import { fetchBranchesThunk } from '@/features/branch/branchThunks'
import { setFilter, setSelectedBranch, clearError } from '@/features/branch/branchSlices'
import type { BranchFilter, Branch } from '@/types/api'

export const useBranch = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { branches, selectedBranch, filter, pagination, loading, error } = useSelector(
    (state: RootState) => state.branch
  )

  const fetchBranches = (filterParams?: BranchFilter) => {
    const params = filterParams || filter
    dispatch(fetchBranchesThunk(params))
  }

  const updateFilter = (newFilter: Partial<BranchFilter>) => {
    dispatch(setFilter(newFilter))
  }

  const selectBranch = (branch: Branch | null) => {
    dispatch(setSelectedBranch(branch))
  }

  const clearBranchError = () => {
    dispatch(clearError())
  }

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearBranchError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return {
    branches,
    selectedBranch,
    filter,
    pagination,
    loading,
    error,
    fetchBranches,
    updateFilter,
    selectBranch,
    clearBranchError,
  }
}
