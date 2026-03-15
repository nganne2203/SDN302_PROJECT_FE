import type { AxiosError } from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { userApi } from '@/apis/user'
import type { ApiError, ShippingAddress, UserInfo } from '@/types/api'
import { extractApiError } from '@/utils/apiError'

import type { ChangePasswordPayload, UpdateProfilePayload } from './userTypes'

export const fetchProfileThunk = createAsyncThunk<UserInfo, void>(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getProfile()
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      return rejectWithValue(
        axiosError.response?.data?.message || 'Khong the tai thong tin nguoi dung'
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
      return rejectWithValue(extractApiError(error, 'Khong the cap nhat thong tin'))
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
        axiosError.response?.data?.message || 'Khong the doi mat khau'
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
        axiosError.response?.data?.message || 'Khong the tai dia chi'
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
        axiosError.response?.data?.message || 'Khong the them dia chi'
      )
    }
  }
)
