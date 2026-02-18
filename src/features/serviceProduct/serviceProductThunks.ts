import { createAsyncThunk } from '@reduxjs/toolkit'
import { serviceProductApi } from '@/apis/serviceProduct'
import { extractApiError } from '@/utils/apiError'
import type { PaginatedResponse } from '@/types/api'
import type { ServiceProduct, ServiceProductFilter, CreateServiceProductRequest, UpdateServiceProductRequest } from './serviceProductTypes'

export const fetchServicesThunk = createAsyncThunk<
  PaginatedResponse<ServiceProduct>,
  ServiceProductFilter
>('serviceProduct/fetchServices', async (filter, { rejectWithValue }) => {
  try {
    const response = await serviceProductApi.getServices(filter)
    return response
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể tải danh sách dịch vụ'))
  }
})

export const createServiceThunk = createAsyncThunk<
  ServiceProduct,
  CreateServiceProductRequest
>('serviceProduct/createService', async (data, { rejectWithValue }) => {
  try {
    const response = await serviceProductApi.createService(data)
    return response.data
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể tạo dịch vụ'))
  }
})

export const getServiceByIdThunk = createAsyncThunk<
  ServiceProduct,
  string
>('serviceProduct/getServiceById', async (id, { rejectWithValue }) => {
  try {
    const response = await serviceProductApi.getServiceById(id)
    return response.data
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể tải thông tin dịch vụ'))
  }
})

export const updateServiceThunk = createAsyncThunk<
  ServiceProduct,
  { id: string; data: UpdateServiceProductRequest }
>('serviceProduct/updateService', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await serviceProductApi.updateService(id, data)
    return response.data
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể cập nhật dịch vụ'))
  }
})

export const deleteServiceThunk = createAsyncThunk<
  string,
  string
>('serviceProduct/deleteService', async (id, { rejectWithValue }) => {
  try {
    await serviceProductApi.deleteService(id)
    return id
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể xóa dịch vụ'))
  }
})

export const updateServiceStatusThunk = createAsyncThunk<
  ServiceProduct,
  { id: string; isActive: boolean }
>('serviceProduct/updateServiceStatus', async ({ id, isActive }, { rejectWithValue }) => {
  try {
    const response = await serviceProductApi.updateServiceStatus(id, isActive)
    return response.data
  } catch (error) {
    return rejectWithValue(extractApiError(error, 'Không thể cập nhật trạng thái'))
  }
})
