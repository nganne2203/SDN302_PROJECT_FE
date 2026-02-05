import { createAsyncThunk } from '@reduxjs/toolkit'
import branchApi from '@/apis/branch'
import type { ApiError } from '@/types/api'
import type { AxiosError } from 'axios'
import { isCacheValid, CACHE_DURATION } from '@/utils/cacheHelper'
import type { RootState } from '@/apps/store'
import type {
  Branch,
  BranchFilter,
  FetchBranchesPayload,
  CreateBranchPayload,
  UpdateBranchPayload
} from './branchTypes'

const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.message || fallback
}

export const fetchBranchesThunk = createAsyncThunk<
  FetchBranchesPayload,
  { filter?: BranchFilter; forceRefresh?: boolean } | undefined,
  { rejectValue: string }
>('branch/fetchBranches', async (options, { rejectWithValue, getState }) => {
  const filter = options?.filter
  const forceRefresh = options?.forceRefresh || false

  // Check cache
  const state = getState() as RootState
  const { cache, branches, pagination } = state.branch

  if (
    !forceRefresh &&
    branches.length > 0 &&
    isCacheValid(cache.lastFetched, CACHE_DURATION.MEDIUM)
  ) {
    return { items: branches, pagination: pagination! }
  }

  try {
    const response = await branchApi.getBranches(filter)
    return { items: response.data, pagination: response.pagination }
  } catch (e) {
    return rejectWithValue(getErrorMessage(e, 'Không thể tải danh sách chi nhánh'))
  }
})

export const fetchBranchByIdThunk = createAsyncThunk<
  Branch,
  string,
  { rejectValue: string }
>('branch/fetchBranchById', async (id, { rejectWithValue }) => {
  try {
    const response = await branchApi.getBranchById(id)
    return response.data
  } catch (e) {
    return rejectWithValue(getErrorMessage(e, 'Không thể tải thông tin chi nhánh'))
  }
})

export const createBranchThunk = createAsyncThunk<
  Branch,
  CreateBranchPayload,
  { rejectValue: string }
>('branch/createBranch', async (data, { rejectWithValue }) => {
  try {
    const response = await branchApi.createBranch(data)
    return response.data
  } catch (e) {
    return rejectWithValue(getErrorMessage(e, 'Không thể tạo chi nhánh'))
  }
})

export const updateBranchThunk = createAsyncThunk<
  Branch,
  { id: string; data: UpdateBranchPayload },
  { rejectValue: string }
>('branch/updateBranch', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await branchApi.updateBranch(id, data)
    return response.data
  } catch (e) {
    return rejectWithValue(getErrorMessage(e, 'Không thể cập nhật chi nhánh'))
  }
})

export const updateBranchStatusThunk = createAsyncThunk<
  Branch,
  { id: string; isActive: boolean },
  { rejectValue: string }
>('branch/updateBranchStatus', async ({ id, isActive }, { rejectWithValue }) => {
  try {
    const response = await branchApi.updateBranchStatus(id, isActive)
    return response.data
  } catch (e) {
    return rejectWithValue(getErrorMessage(e, 'Không thể cập nhật trạng thái chi nhánh'))
  }
})

export const assignBranchManagerThunk = createAsyncThunk<
  Branch,
  { id: string; manager: string },
  { rejectValue: string }
>('branch/assignManager', async ({ id, manager }, { rejectWithValue }) => {
  try {
    const response = await branchApi.assignManager(id, manager)
    return response.data
  } catch (e) {
    return rejectWithValue(getErrorMessage(e, 'Không thể gán quản lý cho chi nhánh'))
  }
})

export const removeBranchManagerThunk = createAsyncThunk<
  Branch,
  { id: string },
  { rejectValue: string }
>('branch/removeManager', async ({ id }, { rejectWithValue }) => {
  try {
    const response = await branchApi.removeManager(id)
    return response.data
  } catch (e) {
    return rejectWithValue(getErrorMessage(e, 'Không thể gỡ quản lý khỏi chi nhánh'))
  }
})
