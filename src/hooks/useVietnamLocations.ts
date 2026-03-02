import { useCallback, useRef, useState } from 'react'
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

const UPDATED_PROVINCE_CODES = [
  1, 4, 8, 11, 12, 14, 15, 19, 20, 22, 24, 25, 31, 33, 37, 38, 40, 42,
  44, 46, 48, 51, 52, 56, 66, 68, 75, 79, 80, 82, 86, 91, 92, 96
]

export const useVietnamLocations = () => {
  const [provinceOptions, setProvinceOptions] = useState<LocationOption[]>([])
  const [districtOptions, setDistrictOptions] = useState<LocationOption[]>([])
  const [wardOptions, setWardOptions] = useState<LocationOption[]>([])
  const districtRequestIdRef = useRef(0)
  const wardRequestIdRef = useRef(0)
  const [loading, setLoading] = useState<LoadingState>({
    provinces: false,
    districts: false,
    wards: false
  })

  const fetchProvinces = useCallback(async (search = '') => {
    setLoading((prev) => ({ ...prev, provinces: true }))
    try {
      const data = await provinceApi.listProvinces(search)
      const filtered = data.filter((province) => UPDATED_PROVINCE_CODES.includes(province.code))
      setProvinceOptions(toOptions(filtered))
    } finally {
      setLoading((prev) => ({ ...prev, provinces: false }))
    }
  }, [])

  const fetchDistricts = useCallback(async (provinceCode: number, search = '') => {
    if (!provinceCode) {
      setDistrictOptions([])
      return
    }
    districtRequestIdRef.current += 1
    const requestId = districtRequestIdRef.current
    setLoading((prev) => ({ ...prev, districts: true }))
    try {
      const data = await provinceApi.listDistricts(provinceCode, search)
      if (requestId === districtRequestIdRef.current) {
        setDistrictOptions(toOptions(data))
      }
    } finally {
      if (requestId === districtRequestIdRef.current) {
        setLoading((prev) => ({ ...prev, districts: false }))
      }
    }
  }, [])

  const fetchWards = useCallback(async (districtCode: number, search = '') => {
    if (!districtCode) {
      setWardOptions([])
      return
    }
    wardRequestIdRef.current += 1
    const requestId = wardRequestIdRef.current
    setLoading((prev) => ({ ...prev, wards: true }))
    try {
      const data = await provinceApi.listWards(districtCode, search)
      if (requestId === wardRequestIdRef.current) {
        setWardOptions(toOptions(data))
      }
    } finally {
      if (requestId === wardRequestIdRef.current) {
        setLoading((prev) => ({ ...prev, wards: false }))
      }
    }
  }, [])

  const clearDistricts = useCallback(() => {
    districtRequestIdRef.current += 1
    setDistrictOptions([])
  }, [])

  const clearWards = useCallback(() => {
    wardRequestIdRef.current += 1
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
