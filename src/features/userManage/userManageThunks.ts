import { createAsyncThunk } from '@reduxjs/toolkit'
import { userManageApi } from '@/apis/userManage'
import { extractApiError } from '@/utils/apiError'
import { invalidateBranchCache } from '@/features/branch/branchSlices'
import type {
  UserManageFilter,
  CreateUserRequest,
  UpdateUserRequest
} from '@/types/api'
import type { User, FetchUsersPayload } from './userManageTypes'

// Fetch users with filtering, pagination, and sorting
export const fetchUsersThunk = createAsyncThunk<FetchUsersPayload, UserManageFilter | undefined>(
  'userManage/fetchUsers',
  async (filter, { rejectWithValue }) => {
    try {
      const response = await userManageApi.getUsers(filter)
      return {
        items: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải danh sách người dùng'))
    }
  }
)

// Fetch users for manager role (uses /api/v1/users/manager)
export const fetchManagerUsersThunk = createAsyncThunk<FetchUsersPayload, UserManageFilter | undefined>(
  'userManage/fetchManagerUsers',
  async (filter, { rejectWithValue }) => {
    try {
      const response = await userManageApi.getManagerUsers(filter)
      return {
        items: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải danh sách người dùng'))
    }
  }
)

// Fetch customers for staff role (uses /api/v1/users/customers)
export const fetchCustomersThunk = createAsyncThunk<FetchUsersPayload, UserManageFilter | undefined>(
  'userManage/fetchCustomers',
  async (filter, { rejectWithValue }) => {
    try {
      const response = await userManageApi.getCustomers(filter)
      return {
        items: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải danh sách khách hàng'))
    }
  }
)

// Create a new user
export const createUserThunk = createAsyncThunk<User, CreateUserRequest>(
  'userManage/createUser',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await userManageApi.createUser(data)
      dispatch(invalidateBranchCache())
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tạo người dùng'))
    }
  }
)

// Get user by ID
export const getUserByIdThunk = createAsyncThunk<User, string>(
  'userManage/getUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userManageApi.getUserById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải thông tin người dùng'))
    }
  }
)

// Update user by ID
export const updateUserThunk = createAsyncThunk<User, { id: string; data: UpdateUserRequest }>(
  'userManage/updateUser',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await userManageApi.updateUser(id, data)
      dispatch(invalidateBranchCache())
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể cập nhật người dùng'))
    }
  }
)

// Update user status by ID
export const updateUserStatusThunk = createAsyncThunk<User, { id: string; isActive: boolean }>(
  'userManage/updateUserStatus',
  async ({ id, isActive }, { rejectWithValue, dispatch }) => {
    try {
      const response = await userManageApi.updateUserStatus(id, { isActive })
      dispatch(invalidateBranchCache())
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể cập nhật trạng thái người dùng'))
    }
  }
)
