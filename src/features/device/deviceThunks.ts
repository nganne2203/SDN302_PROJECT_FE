import { createAsyncThunk } from '@reduxjs/toolkit'
import { deviceApi } from '@/apis/device'
import { extractApiError } from '@/utils/apiError'
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
      return rejectWithValue(extractApiError(error, 'Khong the tai danh sach thiet bi'))
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
      return rejectWithValue(extractApiError(error, 'Khong the tai thong tin thiet bi'))
    }
  }
)

export const createDeviceThunk = createAsyncThunk<Device, CreateDevicePayload>(
  'device/createDevice',
  async (data, { rejectWithValue }) => {
    try {
      const response = await deviceApi.createDevice(data)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Khong the tao thiet bi'))
    }
  }
)

export const updateDeviceThunk = createAsyncThunk<
  Device,
  { id: string; data: CreateDevicePayload }
>(
  'device/updateDevice',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await deviceApi.updateDevice(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Khong the cap nhat thiet bi'))
    }
  }
)

export const deleteDeviceThunk = createAsyncThunk<string, string>(
  'device/deleteDevice',
  async (id, { rejectWithValue }) => {
    try {
      await deviceApi.deleteDevice(id)
      return id
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Khong the xoa thiet bi'))
    }
  }
)

export const updateDeviceStatusThunk = createAsyncThunk<Device, { id: string; isActive: boolean }>(
  'device/updateDeviceStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await deviceApi.updateDeviceStatus(id, isActive)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Khong the cap nhat trang thai thiet bi'))
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
      return rejectWithValue(extractApiError(error, 'Khong the tai danh sach tat ca thiet bi'))
    }
  }
)
