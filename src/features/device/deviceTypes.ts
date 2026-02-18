import type { PaginationMeta } from '@/types/api'
import type { CacheMetadata } from '@/utils/cacheHelper'

export interface Device {
  _id: string
  name: string
  type: string
  brand: string
  model: string
  isActive: boolean
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
}

export interface DeviceState {
  devices: Device[]
  selectedDevice: Device | null
  pagination: PaginationMeta | null
  filter: DeviceFilter
  isLoading: boolean
  error: string | null
  cache: CacheMetadata
}

export interface DeviceFilter {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateDevicePayload {
  name: string
  type: string
  brand: string
  model: string
}

export interface UpdateDevicePayload {
  id: string
  data: CreateDevicePayload
}

export interface FetchDevicesPayload {
  items: Device[]
  pagination: PaginationMeta
}
