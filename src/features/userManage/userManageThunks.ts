import { createAsyncThunk } from '@reduxjs/toolkit'
import { userManageApi } from '@/apis/userManage'
import type { 
  UserManageFilter, 
  CreateUserRequest, 
  UpdateUserRequest
} from '@/types/api'
import type { User, FetchUsersPayload } from './userManageTypes'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

// Fetch users with filtering, pagination, and sorting
export const fetchUsersThunk = createAsyncThunk<FetchUsersPayload, UserManageFilter | undefined>(
  'userManage/fetchUsers',
  async (filter, { rejectWithValue }) => {
    try {
      const response = await userManageApi.getUsers(filter)
      return {
        items: response.data,
        pagination: response.pagination,
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      return rejectWithValue(
        errorData?.errors?.[0] || errorData?.message || 'Không thể tải danh sách người dùng'
      )
    }
  }
)

// Create a new user
export const createUserThunk = createAsyncThunk<User, CreateUserRequest>(
  'userManage/createUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await userManageApi.createUser(data)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      return rejectWithValue(
        errorData?.errors?.[0] || errorData?.message || 'Không thể tạo người dùng'
      )
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
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      return rejectWithValue(
        errorData?.errors?.[0] || errorData?.message || 'Không thể tải thông tin người dùng'
      )
    }
  }
)

// Update user by ID
export const updateUserThunk = createAsyncThunk<User, { id: string; data: UpdateUserRequest }>(
  'userManage/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await userManageApi.updateUser(id, data)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      return rejectWithValue(
        errorData?.errors?.[0] || errorData?.message || 'Không thể cập nhật người dùng'
      )
    }
  }
)

// Update user status by ID
export const updateUserStatusThunk = createAsyncThunk<User, { id: string; isActive: boolean }>(
  'userManage/updateUserStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await userManageApi.updateUserStatus(id, { isActive })
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      return rejectWithValue(
        errorData?.errors?.[0] || errorData?.message || 'Không thể cập nhật trạng thái người dùng'
      )
    }
  }
)
