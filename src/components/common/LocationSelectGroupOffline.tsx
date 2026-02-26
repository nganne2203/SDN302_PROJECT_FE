import { useEffect } from 'react'
import { SelectField } from '@/components/common'
import useVietnamLocationsOffline from '@/hooks/useVietnamLocationsOffline'

type LocationChange = Partial<{
  province: string
  district: string
  ward: string
  provinceCode: string | undefined
  districtCode: string | undefined
  wardCode: string | undefined
}>

// eslint-disable-next-line no-unused-vars
type LocationChangeHandler = (changes: LocationChange) => void

interface LocationSelectGroupOfflineProps {
  provinceCode?: string
  districtCode?: string
  wardCode?: string
  onChange: LocationChangeHandler
  disabled?: boolean
}

const LocationSelectGroupOffline = ({
  provinceCode,
  districtCode,
  wardCode,
  onChange,
  disabled = false
}: LocationSelectGroupOfflineProps) => {
  const {
    provinceOptions,
    districtOptions,
    wardOptions,
    loading,
    fetchProvinces,
    fetchDistricts,
    fetchWards,
    clearDistricts,
    clearWards
  } = useVietnamLocationsOffline()

  useEffect(() => {
    fetchProvinces('')
  }, [fetchProvinces])

  useEffect(() => {
    if (provinceCode) {
      fetchDistricts(provinceCode, '')
    }
  }, [provinceCode, fetchDistricts])

  useEffect(() => {
    if (districtCode) {
      fetchWards(districtCode, '')
    }
  }, [districtCode, fetchWards])

  const handleProvinceChange = (value?: string) => {
    const selected = provinceOptions.find((item) => item.value === value)
    onChange({
      province: selected?.label || '',
      provinceCode: value,
      district: '',
      districtCode: undefined,
      ward: '',
      wardCode: undefined
    })
    clearDistricts()
    clearWards()
  }

  const handleDistrictChange = (value?: string) => {
    const selected = districtOptions.find((item) => item.value === value)
    onChange({
      district: selected?.label || '',
      districtCode: value,
      ward: '',
      wardCode: undefined
    })
    clearWards()
  }

  const handleWardChange = (value?: string) => {
    const selected = wardOptions.find((item) => item.value === value)
    onChange({
      ward: selected?.label || '',
      wardCode: value
    })
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <SelectField
        label="Tỉnh/Thành phố"
        placeholder="Chọn tỉnh/thành phố"
        value={provinceCode}
        options={provinceOptions}
        showSearch
        filterOption={false}
        loading={loading.provinces}
        onSearch={(value) => fetchProvinces(value)}
        onChange={(value) => handleProvinceChange(value as string | undefined)}
        disabled={disabled}
        allowClear
      />
      <SelectField
        label="Quận/Huyện"
        placeholder="Chọn quận/huyện"
        value={districtCode}
        options={districtOptions}
        showSearch
        filterOption={false}
        loading={loading.districts}
        onSearch={(value) => {
          if (provinceCode) fetchDistricts(provinceCode, value)
        }}
        onChange={(value) => handleDistrictChange(value as string | undefined)}
        disabled={disabled || !provinceCode}
        allowClear
      />
      <SelectField
        label="Phường/Xã"
        placeholder="Chọn phường/xã"
        value={wardCode}
        options={wardOptions}
        showSearch
        filterOption={false}
        loading={loading.wards}
        onSearch={(value) => {
          if (districtCode) fetchWards(districtCode, value)
        }}
        onChange={(value) => handleWardChange(value as string | undefined)}
        disabled={disabled || !districtCode}
        allowClear
      />
    </div>
  )
}

export default LocationSelectGroupOffline