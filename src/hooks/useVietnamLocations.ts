import { useCallback, useState } from 'react'
import provinceApi, { type ProvinceItem, type DistrictItem, type WardItem } from '@/apis/province'

export interface LocationOption {
  value: number
  label: string
  districtCode?: number
  districtName?: string
}

interface LoadingState {
  provinces: boolean
  districts: boolean
  wards: boolean
}

const provinceCache = new Map<string, LocationOption[]>()
const districtCache = new Map<string, LocationOption[]>()
const wardCache = new Map<string, LocationOption[]>()

const provincePending = new Map<string, Promise<LocationOption[]>>()
const districtPending = new Map<string, Promise<LocationOption[]>>()
const wardPending = new Map<string, Promise<LocationOption[]>>()

const toOptions = (items: Array<ProvinceItem | DistrictItem | WardItem>): LocationOption[] => {
  return items.map((item) => ({
    value: item.code,
    label: item.name,
    districtCode: 'district_code' in item ? item.district_code : undefined,
    districtName: 'district_name' in item ? item.district_name : undefined
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
    const cacheKey = search.trim().toLowerCase()
    const cached = provinceCache.get(cacheKey)
    if (cached) {
      setProvinceOptions(cached)
      return
    }

    const pending = provincePending.get(cacheKey)
    if (pending) {
      const options = await pending
      setProvinceOptions(options)
      return
    }

    setLoading((prev) => ({ ...prev, provinces: true }))
    try {
      const request = provinceApi
        .listProvinces(search)
        .then((data) => {
          const options = toOptions(data)
          provinceCache.set(cacheKey, options)
          return options
        })
      provincePending.set(cacheKey, request)

      const options = await request
      setProvinceOptions(options)
    } finally {
      provincePending.delete(cacheKey)
      setLoading((prev) => ({ ...prev, provinces: false }))
    }
  }, [])

  const fetchDistricts = useCallback(async (provinceCode: number, search = '') => {
    if (!provinceCode) {
      setDistrictOptions([])
      return
    }

    const cacheKey = `${provinceCode}:${search.trim().toLowerCase()}`
    const cached = districtCache.get(cacheKey)
    if (cached) {
      setDistrictOptions(cached)
      return
    }

    const pending = districtPending.get(cacheKey)
    if (pending) {
      const options = await pending
      setDistrictOptions(options)
      return
    }

    setLoading((prev) => ({ ...prev, districts: true }))
    try {
      const request = provinceApi
        .listDistricts(provinceCode, search)
        .then((data) => {
          const options = toOptions(data)
          districtCache.set(cacheKey, options)
          return options
        })
      districtPending.set(cacheKey, request)

      const options = await request
      setDistrictOptions(options)
    } finally {
      districtPending.delete(cacheKey)
      setLoading((prev) => ({ ...prev, districts: false }))
    }
  }, [])

  const fetchWards = useCallback(async (districtCode: number, search = '') => {
    if (!districtCode) {
      setWardOptions([])
      return
    }

    const cacheKey = `${districtCode}:${search.trim().toLowerCase()}`
    const cached = wardCache.get(cacheKey)
    if (cached) {
      setWardOptions(cached)
      return
    }

    const pending = wardPending.get(cacheKey)
    if (pending) {
      const options = await pending
      setWardOptions(options)
      return
    }

    setLoading((prev) => ({ ...prev, wards: true }))
    try {
      const request = provinceApi
        .listWards(districtCode, search)
        .then((data) => {
          const options = toOptions(data)
          wardCache.set(cacheKey, options)
          return options
        })
      wardPending.set(cacheKey, request)

      const options = await request
      setWardOptions(options)
    } finally {
      wardPending.delete(cacheKey)
      setLoading((prev) => ({ ...prev, wards: false }))
    }
  }, [])

  const fetchWardsByProvince = useCallback(async (provinceCode: number, search = '') => {
    if (!provinceCode) {
      setWardOptions([])
      return
    }

    const cacheKey = `province:${provinceCode}:${search.trim().toLowerCase()}`
    const cached = wardCache.get(cacheKey)
    if (cached) {
      setWardOptions(cached)
      return
    }

    const pending = wardPending.get(cacheKey)
    if (pending) {
      const options = await pending
      setWardOptions(options)
      return
    }

    setLoading((prev) => ({ ...prev, wards: true }))
    try {
      const request = provinceApi
        .listWardsByProvince(provinceCode, search)
        .then((data) => {
          const options = toOptions(data)
          wardCache.set(cacheKey, options)
          return options
        })
      wardPending.set(cacheKey, request)

      const options = await request
      setWardOptions(options)
    } finally {
      wardPending.delete(cacheKey)
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
    fetchWardsByProvince,
    clearDistricts,
    clearWards
  }
}

export default useVietnamLocations
