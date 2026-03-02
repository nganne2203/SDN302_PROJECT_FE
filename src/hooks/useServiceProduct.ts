import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import {
  fetchServicesThunk,
  createServiceThunk,
  getServiceByIdThunk,
  updateServiceThunk,
  deleteServiceThunk,
  updateServiceStatusThunk
} from '@/features/serviceProduct/serviceProductThunks'
import {
  setFilter,
  clearFilter,
  setSelectedService,
  clearError
} from '@/features/serviceProduct/serviceProductSlice'
import type {
  ServiceProduct,
  ServiceProductFilter,
  CreateServiceProductRequest,
  UpdateServiceProductRequest
} from '@/features/serviceProduct/serviceProductTypes'

// eslint-disable-next-line no-unused-vars
type ServiceProductFilterUpdater = (filter: ServiceProductFilter) => ServiceProductFilter

export const useServiceProduct = () => {
  const dispatch = useAppDispatch()
  const {
    services,
    pagination,
    listLoading,
    actionLoading,
    filter,
    error,
    selectedService
  } = useAppSelector((state) => state.serviceProduct)

  const fetchServices = useCallback((filterData?: ServiceProductFilter) => {
    const newFilter = { ...filter, ...filterData }
    dispatch(setFilter(newFilter))
    dispatch(fetchServicesThunk(newFilter))
  }, [dispatch, filter])

  const createService = useCallback(async (data: CreateServiceProductRequest) => {
    const result = await dispatch(createServiceThunk(data))
    if (createServiceThunk.fulfilled.match(result)) {
      dispatch(fetchServicesThunk(filter))
      return result.payload
    }
    throw result.payload
  }, [dispatch, filter])

  const getServiceById = useCallback(async (id: string) => {
    const result = await dispatch(getServiceByIdThunk(id))
    if (getServiceByIdThunk.fulfilled.match(result)) {
      return result.payload
    }
    throw result.payload
  }, [dispatch])

  const updateService = useCallback(async (id: string, data: UpdateServiceProductRequest) => {
    const result = await dispatch(updateServiceThunk({ id, data }))
    if (updateServiceThunk.fulfilled.match(result)) {
      dispatch(fetchServicesThunk(filter))
      return result.payload
    }
    throw result.payload
  }, [dispatch, filter])

  const updateServiceStatus = useCallback(async (id: string, isActive: boolean) => {
    const result = await dispatch(updateServiceStatusThunk({ id, isActive }))
    if (updateServiceStatusThunk.fulfilled.match(result)) {
      return result.payload
    }
    throw result.payload
  }, [dispatch])

  const deleteService = useCallback(async (id: string) => {
    const result = await dispatch(deleteServiceThunk(id))
    if (deleteServiceThunk.fulfilled.match(result)) {
      dispatch(fetchServicesThunk(filter))
      return result.payload
    }
    throw result.payload
  }, [dispatch, filter])

  const handleSetFilter = useCallback((newFilter: ServiceProductFilter | ServiceProductFilterUpdater) => {
    if (typeof newFilter === 'function') {
      const updatedFilter = newFilter(filter)
      dispatch(setFilter(updatedFilter))
    } else {
      dispatch(setFilter(newFilter))
    }
  }, [dispatch, filter])

  const handleClearFilter = useCallback(() => {
    dispatch(clearFilter())
  }, [dispatch])

  const handleSetSelectedService = useCallback((service: ServiceProduct | null) => {
    dispatch(setSelectedService(service))
  }, [dispatch])

  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const servicesWithDefaults = useMemo(
    () => services.map((service: ServiceProduct) => ({
      key: service._id,
      ...service
    })),
    [services]
  )

  return {
    services: servicesWithDefaults,
    selectedService,
    pagination,
    filter,
    listLoading,
    actionLoading,
    error,
    fetchServices,
    createService,
    getServiceById,
    updateService,
    updateServiceStatus,
    deleteService,
    handleSetFilter,
    handleClearFilter,
    handleSetSelectedService,
    handleClearError
  }
}

export default useServiceProduct
