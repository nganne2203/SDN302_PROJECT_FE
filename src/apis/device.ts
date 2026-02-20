import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { Device, DeviceFilter, CreateDevicePayload } from '@/features/device/deviceTypes'

export const deviceApi = {
  getDevices: async (filter?: DeviceFilter): Promise<PaginatedResponse<Device>> => {
    const response = await apiClient.get<PaginatedResponse<Device>>(
      API_ENDPOINTS.DEVICE.LIST,
      { params: filter }
    )
    return response.data
  },

  getDeviceById: async (id: string): Promise<ApiResponse<Device>> => {
    const response = await apiClient.get<ApiResponse<Device>>(
      API_ENDPOINTS.DEVICE.DETAIL(id)
    )
    return response.data
  },

  createDevice: async (data: CreateDevicePayload): Promise<ApiResponse<Device>> => {
    const response = await apiClient.post<ApiResponse<Device>>(
      API_ENDPOINTS.DEVICE.CREATE,
      data
    )
    return response.data
  },

  updateDevice: async (id: string, data: CreateDevicePayload): Promise<ApiResponse<Device>> => {
    const response = await apiClient.put<ApiResponse<Device>>(
      API_ENDPOINTS.DEVICE.UPDATE(id),
      data
    )
    return response.data
  },

  deleteDevice: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.DEVICE.DELETE(id)
    )
    return response.data
  },

  updateDeviceStatus: async (id: string, isActive: boolean): Promise<ApiResponse<Device>> => {
    const response = await apiClient.patch<ApiResponse<Device>>(
      API_ENDPOINTS.DEVICE.UPDATE_STATUS(id),
      { isActive }
    )
    return response.data
  },

  getAllDevices: async (): Promise<ApiResponse<Device[]>> => {
    const response = await apiClient.get<ApiResponse<Device[]>>(
      API_ENDPOINTS.DEVICE.ALL
    )
    return response.data
  }
}

export default deviceApi
