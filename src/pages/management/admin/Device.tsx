import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDevice, type DeviceFormData, deviceValidationSchema } from '@/hooks/useDevice'
import { toast } from '@/utils/toast'
import { DEVICE_TYPES } from '@/features/device/deviceTypes'
import type { Device, DeviceFilter } from '@/features/device/deviceTypes'
import DeviceHeader from '@/components/device/DeviceHeader'
import DeviceFilterComponent from '@/components/device/DeviceFilter'
import DeviceListComponent from '@/components/device/DeviceList'
import DeviceModalComponent from '@/components/device/DeviceModal'

const ManagementDevice = () => {
  const {
    devices,
    pagination,
    filter,
    isLoading,
    error,
    fetchDevices,
    handleSetFilter,
    handleClearFilter,
    handleSetSelectedDevice,
    handleClearError,
    createDevice,
    updateDevice,
    deleteDevice,
    updateDeviceStatus
  } = useDevice()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const lastFetchParamsRef = useRef<string>('')

  const {
    control,
    handleSubmit,
    reset
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceValidationSchema),
    defaultValues: { name: '', type: DEVICE_TYPES.SMARTPHONE, brand: '', model: '' }
  })

  useEffect(() => {
    const filterParams: DeviceFilter = {
      page: (filter.page as number) || 1,
      limit: (filter.limit as number) || 10,
      search: (filter.search as string) || undefined,
      sortBy: (filter.sortBy as string) || 'createdAt',
      sortOrder: (filter.sortOrder as 'asc' | 'desc') || 'desc'
    }
    const paramsKey = JSON.stringify(filterParams)

    if (lastFetchParamsRef.current === paramsKey) return

    lastFetchParamsRef.current = paramsKey
    fetchDevices(filterParams)
  }, [filter, fetchDevices])

  useEffect(() => {
    if (!isModalOpen && error) {
      handleClearError()
    }
  }, [isModalOpen, error, handleClearError])

  const handleOpenModal = useCallback((device?: Device) => {
    if (device) {
      reset({
        name: device.name,
        type: device.type,
        brand: device.brand,
        model: device.model
      })
      setSelectedDeviceId(device._id)
      handleSetSelectedDevice(device)
      setIsEditMode(true)
    } else {
      reset({ name: '', type: DEVICE_TYPES.SMARTPHONE, brand: '', model: '' })
      setSelectedDeviceId(null)
      handleSetSelectedDevice(null)
      setIsEditMode(false)
    }
    setIsModalOpen(true)
  }, [handleSetSelectedDevice, reset])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    reset({ name: '', type: DEVICE_TYPES.SMARTPHONE, brand: '', model: '' })
    setIsEditMode(false)
    setSelectedDeviceId(null)
    handleSetSelectedDevice(null)
  }, [handleSetSelectedDevice, reset])

  const handleSubmitForm = useCallback(async (values: DeviceFormData) => {
    setIsSubmitting(true)
    try {
      let result
      if (isEditMode && selectedDeviceId) {
        result = await updateDevice(selectedDeviceId, {
          name: values.name,
          type: values.type,
          brand: values.brand,
          model: values.model
        })
      } else {
        result = await createDevice({
          name: values.name,
          type: values.type,
          brand: values.brand,
          model: values.model
        })
      }

      if (result.type.includes('fulfilled')) {
        toast.success(isEditMode ? 'Cập nhật thiết bị thành công' : 'Tạo thiết bị thành công')
        handleCloseModal()
      } else if (result.payload) {
        toast.error(result.payload as string)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [isEditMode, selectedDeviceId, updateDevice, createDevice, handleCloseModal])

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteDevice(id)
    if (result.type.includes('fulfilled')) {
      toast.success('Xóa thiết bị thành công')
    } else if (result.payload) {
      toast.error(result.payload as string)
    }
  }, [deleteDevice])

  const handleUpdateStatus = useCallback(async (id: string, isActive: boolean) => {
    const result = await updateDeviceStatus(id, isActive)
    if (result.type.includes('fulfilled')) {
      toast.success('Cập nhật trạng thái thiết bị thành công')
    } else if (result.payload) {
      toast.error(result.payload as string)
    }
  }, [updateDeviceStatus])

  return (
    <div className="p-2">
      <DeviceHeader onAddClick={() => handleOpenModal()} />

      <DeviceFilterComponent
        searchValue={(filter.search as string) || ''}
        onSearchChange={(value) => handleSetFilter({ search: value, page: 1 })}
        filter={filter}
        onFilterChange={(key, value) => {
          if (key === 'sort') {
            const sortData = value as { field?: string; order?: 'asc' | 'desc' | '' }
            handleSetFilter({
              sortBy: sortData.field || 'createdAt',
              sortOrder: (sortData.order as 'asc' | 'desc') || 'desc',
              page: 1
            })
            return
          }

          handleSetFilter({ [key]: value, page: 1 })
        }}
        onPageChange={(page, pageSize) => handleSetFilter({ page, limit: pageSize })}
        onReset={handleClearFilter}
      />

      <DeviceListComponent
        devices={devices}
        isLoading={isLoading}
        pagination={{
          page: (filter.page as number) || 1,
          limit: (filter.limit as number) || 10,
          total: pagination?.totalItems || 0
        }}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        onUpdateStatus={handleUpdateStatus}
        onPageChange={(page, pageSize) => handleSetFilter({ page, limit: pageSize })}
      />

      <DeviceModalComponent
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
        control={control}
        onClose={handleCloseModal}
        onSubmit={handleSubmit(handleSubmitForm)}
      />
    </div>
  )
}

export default ManagementDevice
