import { useCallback, useMemo } from 'react'
import { z } from 'zod'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import type { RootState } from '@/apps/rootReducer'
import type { Branch, BranchFilter, CreateBranchPayload, UpdateBranchPayload } from '@/features/branch/branchTypes'
import {
  fetchBranchesThunk,
  fetchBranchByIdThunk,
  createBranchThunk,
  updateBranchThunk,
  updateBranchStatusThunk,
  assignBranchManagerThunk,
  removeBranchManagerThunk,
} from '@/features/branch/branchThunks'
import { setFilter, clearFilter, setSelectedBranch, clearError } from '@/features/branch/branchSlices'

const branchValidationSchema = z.object({
  name: z.string().min(1, 'Tên chi nhánh không được để trống').max(100, 'Tên chi nhánh không vượt quá 100 ký tự'),
  address: z.string().min(1, 'Địa chỉ không được để trống').max(255, 'Địa chỉ không vượt quá 255 ký tự'),
  manager: z.string().optional().nullable(),
})

export type BranchFormData = z.infer<typeof branchValidationSchema>

export const useBranch = () => {
  const dispatch = useAppDispatch()
  const branchState = useAppSelector((state: RootState) => (state as any).branch)

  const {
    branches = [],
    selectedBranch,
    pagination,
    filter = {},
    isLoading = false,
    error,
  } = branchState || {}

  const fetchBranches = useCallback(
    async (filterData?: BranchFilter) => dispatch(fetchBranchesThunk(filterData)),
    [dispatch]
  )

  const fetchBranchById = useCallback(
    async (id: string) => dispatch(fetchBranchByIdThunk(id)),
    [dispatch]
  )

  const createBranch = useCallback(
    async (data: CreateBranchPayload) => dispatch(createBranchThunk(data)),
    [dispatch]
  )

  const updateBranch = useCallback(
    async (id: string, data: UpdateBranchPayload) => dispatch(updateBranchThunk({ id, data })),
    [dispatch]
  )

  const updateBranchStatus = useCallback(
    async (id: string, isActive: boolean) => dispatch(updateBranchStatusThunk({ id, isActive })),
    [dispatch]
  )

  const assignManager = useCallback(
    async (id: string, manager: string) => dispatch(assignBranchManagerThunk({ id, manager })),
    [dispatch]
  )

  const removeManager = useCallback(
    async (id: string) => dispatch(removeBranchManagerThunk({ id })),
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

  const handleSetSelectedBranch = useCallback(
    (branch: Branch | null) => {
      dispatch(setSelectedBranch(branch))
    },
    [dispatch]
  )

  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const validateBranchForm = useCallback((data: Record<string, unknown>) => {
    try {
      const validated = branchValidationSchema.parse(data)
      return { valid: true, data: validated, errors: {} as Record<string, string> }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        err.issues.forEach((issue) => {
          const path = issue.path.join('.')
          errors[path] = issue.message
        })
        return { valid: false, data: null, errors }
      }
      return { valid: false, data: null, errors: { general: 'Lỗi xác thực' } }
    }
  }, [])

  const branchesWithKeys = useMemo(
    () => branches.map((b: Branch) => ({ ...b, key: b._id })),
    [branches]
  )

  return {
    branches: branchesWithKeys,
    selectedBranch,
    pagination,
    filter,
    isLoading,
    error,
    fetchBranches,
    fetchBranchById,
    createBranch,
    updateBranch,
    updateBranchStatus,
    assignManager,
    removeManager,
    handleSetFilter,
    handleClearFilter,
    handleSetSelectedBranch,
    handleClearError,
    validateBranchForm,
  }
}

export default useBranch
