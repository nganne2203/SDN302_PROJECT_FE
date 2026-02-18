import { useCallback, useState } from 'react'
import provinceApi, { type ProvinceItem, type DistrictItem, type WardItem } from '@/apis/province'

export interface LocationOption {
  value: number
  label: string
}

interface LoadingState {
  provinces: boolean
  districts: boolean
  wards: boolean
}

const toOptions = (items: Array<ProvinceItem | DistrictItem | WardItem>): LocationOption[] => {
  return items.map((item) => ({
    value: item.code,
    label: item.name
  }))
}

export const useVietnamLocations = () => {
  const [provinceOptions, setProvinceOptions] = useState<LocationOption[]>([])
  const [districtOptions, setDistrictOptions] = useState<LocationOption[]>([])
  const [wardOptions, setWardOptions] = useState<LocationOption[]>([])
  const [loading, setLoading] = useState<LoadingState>({
    provinces: false,
    districts: false,
    wards: false
  })

  const fetchProvinces = useCallback(async (search = '') => {
    setLoading((prev) => ({ ...prev, provinces: true }))
    try {
      const data = await provinceApi.listProvinces(search)
      setProvinceOptions(toOptions(data))
    } finally {
      setLoading((prev) => ({ ...prev, provinces: false }))
    }
  }, [])

  const fetchDistricts = useCallback(async (provinceCode: number, search = '') => {
    if (!provinceCode) {
      setDistrictOptions([])
      return
    }
    setLoading((prev) => ({ ...prev, districts: true }))
    try {
      const data = await provinceApi.listDistricts(provinceCode, search)
      setDistrictOptions(toOptions(data))
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }))
    }
  }, [])

  const fetchWards = useCallback(async (districtCode: number, search = '') => {
    if (!districtCode) {
      setWardOptions([])
      return
    }
    setLoading((prev) => ({ ...prev, wards: true }))
    try {
      const data = await provinceApi.listWards(districtCode, search)
      setWardOptions(toOptions(data))
    } finally {
      setLoading((prev) => ({ ...prev, wards: false }))
    }
  }, [])

  const clearDistricts = useCallback(() => {
    setDistrictOptions([])
  }, [])

  const clearWards = useCallback(() => {
    setWardOptions([])
  }, [])

  return {
    provinceOptions,
    districtOptions,
    wardOptions,
    loading,
    fetchProvinces,
    fetchDistricts,
    fetchWards,
    clearDistricts,
    clearWards
  }
}

export default useVietnamLocations
