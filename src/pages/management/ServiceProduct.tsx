import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from '@/utils/toast'
import ServiceProductFilter from '@/components/serviceProduct/ServiceFilter'
import ServiceProductHeader from '@/components/serviceProduct/ServiceHeader'
import ServiceProductList from '@/components/serviceProduct/ServiceList'
import ServiceDetailModal from '@/components/serviceProduct/ServiceDetailModal'
import useServiceProduct from '@/hooks/useServiceProduct'
import type { ServiceProduct, ServiceProductFilter as FilterType, CreateServiceProductRequest, UpdateServiceProductRequest } from '@/features/serviceProduct/serviceProductTypes'

const ManagementServiceProduct = () => {
  const {
    services,
    listLoading,
    actionLoading,
    pagination,
    filter,
    fetchServices,
    createService,
    updateService,
    deleteService,
    updateServiceStatus,
    handleSetFilter,
    handleClearFilter,
    handleClearError,
    error
  } = useServiceProduct()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedServiceForEdit, setSelectedServiceForEdit] = useState<ServiceProduct | null>(null)
  const lastFetchParamsRef = useRef<string>('')

  useEffect(() => {
    const filterParams: FilterType = {
      page: filter.page || 1,
      limit: filter.limit || 10,
      search: filter.search || undefined,
      isActive: typeof filter.isActive === 'boolean' ? filter.isActive : undefined,
      type: filter.type || undefined,
      sortBy: filter.sortBy || 'createdAt',
      sortOrder: filter.sortOrder || 'desc'
    }

    const paramsKey = JSON.stringify(filterParams)
    if (lastFetchParamsRef.current === paramsKey) return

    lastFetchParamsRef.current = paramsKey
    fetchServices(filterParams)
  }, [filter, fetchServices])

  useEffect(() => {
    if (error) {
      return () => handleClearError()
    }
  }, [error, handleClearError])

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    if (key === 'isActive') {
      if (value === '' || value === null || value === undefined) {
        handleSetFilter(prev => ({ ...prev, isActive: undefined, page: 1 }))
        return
      }
      const isActiveValue = value === 'true' ? true : value === 'false' ? false : undefined
      handleSetFilter(prev => ({ ...prev, isActive: isActiveValue, page: 1 }))
      return
    }

    if (key === 'sort') {
      const sortData = value as { field?: string; order?: 'asc' | 'desc' }
      handleSetFilter(prev => ({
        ...prev,
        sortBy: sortData.field || 'createdAt',
        sortOrder: sortData.order || 'desc',
        page: 1
      }))
      return
    }

    handleSetFilter(prev => ({ ...prev, [key]: value, page: 1 }))
  }, [handleSetFilter])

  const handleResetFilter = useCallback(() => {
    handleClearFilter()
  }, [handleClearFilter])

  const handlePageChange = useCallback((page: number, limit: number) => {
    handleSetFilter(prev => ({ ...prev, page, limit }))
  }, [handleSetFilter])

  const handleCreate = useCallback(() => {
    setSelectedServiceForEdit(null)
    setIsModalOpen(true)
  }, [])

  const handleEdit = useCallback((item: ServiceProduct) => {
    setSelectedServiceForEdit(item)
    setIsModalOpen(true)
  }, [])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setSelectedServiceForEdit(null)
  }, [])

  const handleCreateService = async (data: CreateServiceProductRequest) => {
    try {
      await createService(data)
      toast.success('Tạo dịch vụ thành công')
      handleModalClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo dịch vụ'
      toast.error(typeof error === 'string' ? error : errorMessage)
    }
  }

  const handleUpdateService = async (data: UpdateServiceProductRequest) => {
    if (!selectedServiceForEdit) return

    try {
      await updateService(selectedServiceForEdit._id, data)
      toast.success('Cập nhật dịch vụ thành công')
      handleModalClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật dịch vụ'
      toast.error(typeof error === 'string' ? error : errorMessage)
    }
  }

  const handleDelete = useCallback(async (item: ServiceProduct) => {
    if (window.confirm(`Bạn có chắc muốn xóa dịch vụ '${item.name}'?`)) {
      try {
        await deleteService(item._id)
        toast.success('Xóa dịch vụ thành công')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa dịch vụ'
        toast.error(typeof error === 'string' ? error : errorMessage)
      }
    }
  }, [deleteService])

  const handleStatusChange = useCallback(async (id: string, status: boolean) => {
    try {
      await updateServiceStatus(id, status)
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật trạng thái'
      toast.error(typeof error === 'string' ? error : errorMessage)
    }
  }, [updateServiceStatus])

  return (
    <div className='p-4 max-w-[1600px] mx-auto'>
      <ServiceProductHeader onCreate={handleCreate} />

      <div className='mb-6 bg-white p-4 rounded-lg border border-gray-100 shadow-sm'>
        <ServiceProductFilter
          filter={filter}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilter}
        />
      </div>

      <div className='bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'>
        <ServiceProductList
          data={services}
          loading={listLoading}
          pagination={{
            page: pagination?.currentPage || 1,
            limit: pagination?.pageSize || 10,
            total: pagination?.totalItems || 0
          }}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </div>

      <ServiceDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        data={selectedServiceForEdit}
        onSubmit={(data) => selectedServiceForEdit ? handleUpdateService(data as UpdateServiceProductRequest) : handleCreateService(data as CreateServiceProductRequest)}
        loading={actionLoading}
      />
    </div>
  )
}

export default ManagementServiceProduct
