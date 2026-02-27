import { useEffect } from 'react'
import { SelectField } from '@/components/common'
import useVietnamLocations from '@/hooks/useVietnamLocations'

type LocationChange = Partial<{
  province: string
  district: string
  ward: string
  provinceCode: number | undefined
  districtCode: number | undefined
  wardCode: number | undefined
}>

// eslint-disable-next-line no-unused-vars
type LocationChangeHandler = (changes: LocationChange) => void

interface LocationSelectGroupProps {
  provinceCode?: number
  districtCode?: number
  wardCode?: number
  onChange: LocationChangeHandler
  disabled?: boolean
}

const LocationSelectGroup = ({
  provinceCode,
  districtCode,
  wardCode,
  onChange,
  disabled = false
}: LocationSelectGroupProps) => {
  const normalizeText = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

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
  } = useVietnamLocations()

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

  const handleProvinceChange = (value?: number) => {
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

  const handleDistrictChange = (value?: number) => {
    const selected = districtOptions.find((item) => item.value === value)
    onChange({
      district: selected?.label || '',
      districtCode: value,
      ward: '',
      wardCode: undefined
    })
    clearWards()
  }

  const handleWardChange = (value?: number) => {
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
        filterOption={(input, option) => {
          const label = String(option?.label || '')
          return normalizeText(label).includes(normalizeText(input))
        }}
        loading={loading.provinces}
        onChange={(value) => handleProvinceChange(value as number | undefined)}
        disabled={disabled}
        allowClear
      />
      <SelectField
        label="Quận/Huyện"
        placeholder="Chọn quận/huyện"
        value={districtCode}
        options={districtOptions}
        showSearch
        filterOption={(input, option) => {
          const label = String(option?.label || '')
          return normalizeText(label).includes(normalizeText(input))
        }}
        loading={loading.districts}
        onChange={(value) => handleDistrictChange(value as number | undefined)}
        disabled={disabled || !provinceCode}
        allowClear
      />
      <SelectField
        label="Phường/Xã"
        placeholder="Chọn phường/xã"
        value={wardCode}
        options={wardOptions}
        showSearch
        filterOption={(input, option) => {
          const label = String(option?.label || '')
          return normalizeText(label).includes(normalizeText(input))
        }}
        loading={loading.wards}
        onChange={(value) => handleWardChange(value as number | undefined)}
        disabled={disabled || !districtCode}
        allowClear
      />
    </div>
  )
}

export default LocationSelectGroup
