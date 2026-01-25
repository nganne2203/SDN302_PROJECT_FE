import { createAsyncThunk } from '@reduxjs/toolkit'
import { userApi } from '@/apis/user'
import type { UserInfo, ShippingAddress } from '@/types/api'
import type { UpdateProfilePayload, ChangePasswordPayload, User, UserFilter, FetchUsersPayload } from './userTypes'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

export const fetchUsersThunk = createAsyncThunk<FetchUsersPayload, UserFilter | undefined>(
  'user/fetchUsers',
  async (filter, { rejectWithValue }) => {
    try {
      const response = await userApi.getUsers(filter)
      return {
        items: response.data,
        pagination: response.pagination,
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tải danh sách người dùng'
      )
    }
  }
)

export const fetchProfileThunk = createAsyncThunk<UserInfo, void>(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getProfile()
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tải thông tin người dùng'
      )
    }
  }
)

export const updateProfileThunk = createAsyncThunk<UserInfo, UpdateProfilePayload>(
  'user/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await userApi.updateProfile(data)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể cập nhật thông tin'
      )
    }
  }
)

export const changePasswordThunk = createAsyncThunk<void, ChangePasswordPayload>(
  'user/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      await userApi.changePassword(data)
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể đổi mật khẩu'
      )
    }
  }
)

export const fetchAddressesThunk = createAsyncThunk<ShippingAddress[], void>(
  'user/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getAddresses()
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể tải địa chỉ'
      )
    }
  }
)

export const addAddressThunk = createAsyncThunk<ShippingAddress, ShippingAddress>(
  'user/addAddress',
  async (address, { rejectWithValue }) => {
    try {
      const response = await userApi.addAddress(address)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể thêm địa chỉ'
      )
    }
  }
)

export const updateUserStatusThunk = createAsyncThunk<User, { id: string; isActive: boolean }>(
  'user/updateUserStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUserStatus(id, isActive)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Không thể cập nhật trạng thái người dùng'
      )
    }
  }
)
