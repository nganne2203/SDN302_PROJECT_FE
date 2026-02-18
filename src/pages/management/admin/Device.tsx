import { useState, useEffect, useCallback, useRef } from 'react'
import { useDevice, type DeviceFormData } from '@/hooks/useDevice'
import { toast } from '@/utils/toast'
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
    updateDeviceStatus,
    validateDeviceForm
  } = useDevice()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [formData, setFormData] = useState<DeviceFormData>({
    name: '',
    type: '',
    brand: '',
    model: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const lastFetchParamsRef = useRef<string>('')

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
      setFormData({
        name: device.name,
        type: device.type,
        brand: device.brand,
        model: device.model
      })
      setSelectedDeviceId(device._id)
      handleSetSelectedDevice(device)
      setIsEditMode(true)
    } else {
      setFormData({ name: '', type: '', brand: '', model: '' })
      setSelectedDeviceId(null)
      handleSetSelectedDevice(null)
      setIsEditMode(false)
    }
    setFormErrors({})
    setIsModalOpen(true)
  }, [handleSetSelectedDevice])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setFormData({ name: '', type: '', brand: '', model: '' })
    setFormErrors({})
    setIsEditMode(false)
    setSelectedDeviceId(null)
    handleSetSelectedDevice(null)
  }, [handleSetSelectedDevice])

  const handleFormChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [formErrors])

  const handleSubmit = useCallback(async () => {
    const validation = validateDeviceForm(formData)
    if (!validation.valid) {
      setFormErrors(validation.errors)
      return
    }

    setIsSubmitting(true)
    try {
      let result
      if (isEditMode && selectedDeviceId) {
        result = await updateDevice(selectedDeviceId, {
          name: formData.name,
          type: formData.type,
          brand: formData.brand,
          model: formData.model
        })
      } else {
        result = await createDevice({
          name: formData.name,
          type: formData.type,
          brand: formData.brand,
          model: formData.model
        })
      }

      if (result.type.includes('fulfilled')) {
        toast.success(isEditMode ? 'Cap nhat thiet bi thanh cong' : 'Tao thiet bi thanh cong')
        handleCloseModal()
      } else if (result.payload) {
        toast.error(result.payload as string)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isEditMode, selectedDeviceId, validateDeviceForm, updateDevice, createDevice, handleCloseModal])

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteDevice(id)
    if (result.type.includes('fulfilled')) {
      toast.success('Xoa thiet bi thanh cong')
    } else if (result.payload) {
      toast.error(result.payload as string)
    }
  }, [deleteDevice])

  const handleUpdateStatus = useCallback(async (id: string, isActive: boolean) => {
    const result = await updateDeviceStatus(id, isActive)
    if (result.type.includes('fulfilled')) {
      toast.success('Cap nhat trang thai thiet bi thanh cong')
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
        onFilterChange={(key, value) => handleSetFilter({ [key]: value, page: 1 })}
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
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default ManagementDevice
