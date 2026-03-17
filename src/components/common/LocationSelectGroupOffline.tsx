import { useEffect } from 'react'
import { SelectField } from '@/components/common'
import useVietnamLocationsOffline from '@/hooks/useVietnamLocationsOffline'

type LocationChange = Partial<{
  province: string
  ward: string
  provinceCode: string | undefined
  wardCode: string | undefined
}>

// eslint-disable-next-line no-unused-vars
type LocationChangeHandler = (changes: LocationChange) => void

interface LocationSelectGroupOfflineProps {
  provinceCode?: string | number
  wardCode?: string | number
  onChange: LocationChangeHandler
  disabled?: boolean
}

const LocationSelectGroupOffline = ({
  provinceCode,
  wardCode,
  onChange,
  disabled = false
}: LocationSelectGroupOfflineProps) => {
  const normalizedProvinceCode = provinceCode !== undefined ? String(provinceCode) : undefined
  const normalizedWardCode = wardCode !== undefined ? String(wardCode) : undefined

  const {
    provinceOptions,
    wardOptions,
    loading,
    fetchProvinces,
    fetchDistricts,
    fetchWardsByProvince,
    clearDistricts,
    clearWards
  } = useVietnamLocationsOffline()

  useEffect(() => {
    fetchProvinces('')
  }, [fetchProvinces])

  useEffect(() => {
    if (normalizedProvinceCode) {
      fetchDistricts(normalizedProvinceCode, '')
      fetchWardsByProvince(normalizedProvinceCode, '')
    }
  }, [normalizedProvinceCode, fetchDistricts, fetchWardsByProvince])

  const handleProvinceChange = (value?: string) => {
    const selected = provinceOptions.find((item) => item.value === value)
    onChange({
      province: selected?.label || '',
      provinceCode: value,
      ward: '',
      wardCode: undefined
    })
    clearDistricts()
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
    <div className="grid grid-cols-2 gap-2">
      <SelectField
        label="Tỉnh/Thành phố"
        placeholder="Chọn tỉnh/thành phố"
        value={normalizedProvinceCode}
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
        label="Phường/Xã"
        placeholder="Chọn phường/xã"
        value={normalizedWardCode}
        options={wardOptions}
        showSearch
        filterOption={false}
        loading={loading.wards}
        onSearch={(value) => {
          if (normalizedProvinceCode) fetchWardsByProvince(normalizedProvinceCode, value)
        }}
        onChange={(value) => handleWardChange(value as string | undefined)}
        disabled={disabled || !normalizedProvinceCode}
        allowClear
      />
    </div>
  )
}

export default LocationSelectGroupOffline