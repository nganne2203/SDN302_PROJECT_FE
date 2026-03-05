import { useCallback, useState, useMemo } from 'react'
import { vietnamAddressService } from '@/services/vietnamAddressService'

export interface LocationOption {
  value: string
  label: string
}

interface LoadingState {
  provinces: boolean
  districts: boolean
  wards: boolean
}

const useVietnamLocationsOffline = () => {
  const [provinceOptions, setProvinceOptions] = useState<LocationOption[]>([])
  const [districtOptions, setDistrictOptions] = useState<LocationOption[]>([])
  const [wardOptions, setWardOptions] = useState<LocationOption[]>([])
  const [loading, setLoading] = useState<LoadingState>({
    provinces: false,
    districts: false,
    wards: false
  })

  // Load all provinces on initialization
  const allProvinces = useMemo(() => {
    return vietnamAddressService.getProvinces().map(province => ({
      value: province.province_code,
      label: province.name
    }))
  }, [])

  const fetchProvinces = useCallback(async (search = '') => {
    setLoading(prev => ({ ...prev, provinces: true }))

    // Simulate async behavior for consistency with original API
    await new Promise(resolve => setTimeout(resolve, 50))

    try {
      const provinces = vietnamAddressService.getProvinces(search)
      const options = provinces.map(province => ({
        value: province.province_code,
        label: province.name
      }))
      setProvinceOptions(options)
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }))
    }
  }, [])

  const fetchDistricts = useCallback(async (provinceCode: string, search = '') => {
    if (!provinceCode) {
      setDistrictOptions([])
      return
    }

    setLoading(prev => ({ ...prev, districts: true }))

    // Simulate async behavior
    await new Promise(resolve => setTimeout(resolve, 50))

    try {
      const districts = vietnamAddressService.getDistricts(provinceCode, search)
      const options = districts.map(district => ({
        value: district.code,
        label: district.name
      }))
      setDistrictOptions(options)
    } finally {
      setLoading(prev => ({ ...prev, districts: false }))
    }
  }, [])

  const fetchWards = useCallback(async (districtCode: string, search = '') => {
    if (!districtCode) {
      setWardOptions([])
      return
    }

    setLoading(prev => ({ ...prev, wards: true }))

    // Simulate async behavior
    await new Promise(resolve => setTimeout(resolve, 50))

    try {
      const wards = vietnamAddressService.getWards(districtCode, search)
      const options = wards.map(ward => ({
        value: ward.ward_code,
        label: ward.name
      }))
      setWardOptions(options)
    } finally {
      setLoading(prev => ({ ...prev, wards: false }))
    }
  }, [])

  const fetchWardsByProvince = useCallback(async (provinceCode: string, search = '') => {
    if (!provinceCode) {
      setWardOptions([])
      return
    }

    setLoading(prev => ({ ...prev, wards: true }))

    await new Promise(resolve => setTimeout(resolve, 50))

    try {
      const wards = vietnamAddressService.getWardsByProvinceCode(provinceCode, search)
      const options = wards.map(ward => ({
        value: ward.ward_code,
        label: ward.name
      }))
      setWardOptions(options)
    } finally {
      setLoading(prev => ({ ...prev, wards: false }))
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
    clearWards,
    allProvinces // Additional helper for getting all provinces
  }
}

export default useVietnamLocationsOffline