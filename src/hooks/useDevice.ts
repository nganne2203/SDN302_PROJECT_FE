import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import {
  fetchDevicesThunk,
  fetchDeviceByIdThunk,
  createDeviceThunk,
  updateDeviceThunk,
  deleteDeviceThunk,
  updateDeviceStatusThunk,
  fetchAllDevicesThunk
} from '@/features/device/deviceThunks'
import {
  setFilter,
  clearFilter,
  setSelectedDevice,
  clearError
} from '@/features/device/deviceSlices'
import { DEVICE_TYPES } from '@/features/device/deviceTypes'
import type { Device, DeviceFilter, CreateDevicePayload } from '@/features/device/deviceTypes'
import { z } from 'zod'

const DEVICE_TYPE_VALUES = [DEVICE_TYPES.SMARTPHONE, DEVICE_TYPES.TABLET] as const

export const deviceValidationSchema = z.object({
  name: z.string().min(1, 'Ten thiet bi khong duoc de trong').max(100, 'Ten thiet bi khong duoc vuot qua 100 ky tu'),
  type: z.enum(DEVICE_TYPE_VALUES, {
    message: 'Loai thiet bi khong duoc de trong'
  }),
  brand: z.string().min(1, 'Thuong hieu khong duoc de trong').max(100, 'Thuong hieu khong duoc vuot qua 100 ky tu'),
  model: z.string().min(1, 'Model khong duoc de trong').max(100, 'Model khong duoc vuot qua 100 ky tu')
})

export type DeviceFormData = z.infer<typeof deviceValidationSchema>

export const useDevice = () => {
  const dispatch = useAppDispatch()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deviceState = useAppSelector((state: any) => state.device)

  const {
    devices = [],
    selectedDevice,
    pagination,
    filter = {},
    isLoading = false,
    error
  } = deviceState || {}

  const fetchDevices = useCallback(
    async (filterData?: DeviceFilter) => {
      return dispatch(fetchDevicesThunk(filterData))
    },
    [dispatch]
  )

  const fetchAllDevices = useCallback(
    async () => {
      return dispatch(fetchAllDevicesThunk())
    },
    [dispatch]
  )

  const fetchDeviceById = useCallback(
    async (id: string) => {
      return dispatch(fetchDeviceByIdThunk(id))
    },
    [dispatch]
  )

  const createDevice = useCallback(
    async (data: CreateDevicePayload) => {
      return dispatch(createDeviceThunk(data))
    },
    [dispatch]
  )

  const updateDevice = useCallback(
    async (id: string, data: CreateDevicePayload) => {
      return dispatch(updateDeviceThunk({ id, data }))
    },
    [dispatch]
  )

  const deleteDevice = useCallback(
    async (id: string) => {
      return dispatch(deleteDeviceThunk(id))
    },
    [dispatch]
  )

  const updateDeviceStatus = useCallback(
    async (id: string, isActive: boolean) => {
      return dispatch(updateDeviceStatusThunk({ id, isActive }))
    },
    [dispatch]
  )

  const handleSetFilter = useCallback(
    (newFilter: Record<string, unknown>) => {
      dispatch(setFilter(newFilter))
    },
    [dispatch]
  )

  const handleClearFilter = useCallback(() => {
    dispatch(clearFilter())
  }, [dispatch])

  const handleSetSelectedDevice = useCallback(
    (device: Device | null) => {
      dispatch(setSelectedDevice(device))
    },
    [dispatch]
  )

  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const validateDeviceForm = useCallback((data: Record<string, unknown>) => {
    try {
      const validated = deviceValidationSchema.parse(data)
      return { valid: true, data: validated, errors: {} }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        err.issues.forEach((issue) => {
          const path = issue.path.join('.')
          errors[path] = issue.message
        })
        return { valid: false, data: null, errors }
      }
      return { valid: false, data: null, errors: { general: 'Lỗi xác thực' } }
    }
  }, [])

  const devicesWithDefaults = useMemo(() => devices.map((device: Device) => ({
    key: device._id,
    ...device
  })), [devices])

  return {
    devices: devicesWithDefaults,
    selectedDevice,
    pagination,
    filter,
    isLoading,
    error,
    updateDeviceStatus,

    fetchDevices,
    fetchAllDevices,
    fetchDeviceById,
    createDevice,
    updateDevice,
    deleteDevice,
    handleSetFilter,
    handleClearFilter,
    handleSetSelectedDevice,
    handleClearError,

    validateDeviceForm
  }
}

export default useDevice
