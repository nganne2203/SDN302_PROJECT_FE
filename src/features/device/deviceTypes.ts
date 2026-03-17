import type { PaginationMeta } from '@/types/api'
import type { CacheMetadata } from '@/utils/cacheHelper'

export const DEVICE_TYPES = {
  SMARTPHONE: 'smartphone',
  TABLET: 'tablet'
} as const

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  [DEVICE_TYPES.SMARTPHONE]: 'Điện thoại',
  [DEVICE_TYPES.TABLET]: 'Máy tính bảng'
}

export const getDeviceTypeLabel = (type?: string) => {
  if (!type) return 'Không xác định'
  return DEVICE_TYPE_LABELS[type as DeviceType] || type
}

export type DeviceType = (typeof DEVICE_TYPES)[keyof typeof DEVICE_TYPES]

export interface Device {
  _id: string
  name: string
  type: DeviceType
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
  type: DeviceType
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
