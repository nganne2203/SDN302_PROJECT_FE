import { createAsyncThunk } from '@reduxjs/toolkit'
import { userApi } from '@/apis/user'
import type { UserInfo, ShippingAddress } from '@/types/api'
import type { UpdateProfilePayload, ChangePasswordPayload } from './userTypes'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

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
