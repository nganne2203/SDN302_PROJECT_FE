import { createAsyncThunk } from '@reduxjs/toolkit'
import { deviceApi } from '@/apis/device'
import { extractApiError } from '@/utils/apiError'
import { invalidateProductCache } from '@/features/product/productSlices'
import type { Device, DeviceFilter, CreateDevicePayload, FetchDevicesPayload } from './deviceTypes'

export const fetchDevicesThunk = createAsyncThunk<FetchDevicesPayload, DeviceFilter | undefined>(
  'device/fetchDevices',
  async (filter, { rejectWithValue }) => {
    try {
      const response = await deviceApi.getDevices(filter)
      return {
        items: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải danh sách thiết bị'))
    }
  }
)

export const fetchDeviceByIdThunk = createAsyncThunk<Device, string>(
  'device/fetchDeviceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await deviceApi.getDeviceById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải thông tin thiết bị'))
    }
  }
)

export const createDeviceThunk = createAsyncThunk<Device, CreateDevicePayload>(
  'device/createDevice',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deviceApi.createDevice(data)
      dispatch(invalidateProductCache())
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tạo thiết bị'))
    }
  }
)

export const updateDeviceThunk = createAsyncThunk<
  Device,
  { id: string; data: CreateDevicePayload }
>(
  'device/updateDevice',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await deviceApi.updateDevice(id, data)
      dispatch(invalidateProductCache())
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể cập nhật thiết bị'))
    }
  }
)

export const deleteDeviceThunk = createAsyncThunk<string, string>(
  'device/deleteDevice',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await deviceApi.deleteDevice(id)
      dispatch(invalidateProductCache())
      return id
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể xóa thiết bị'))
    }
  }
)

export const updateDeviceStatusThunk = createAsyncThunk<Device, { id: string; isActive: boolean }>(
  'device/updateDeviceStatus',
  async ({ id, isActive }, { rejectWithValue, dispatch }) => {
    try {
      const response = await deviceApi.updateDeviceStatus(id, isActive)
      dispatch(invalidateProductCache())
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể cập nhật trạng thái thiết bị'))
    }
  }
)

export const fetchAllDevicesThunk = createAsyncThunk<Device[], void>(
  'device/fetchAllDevices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await deviceApi.getAllDevices()
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải danh sách tất cả thiết bị'))
    }
  }
)
