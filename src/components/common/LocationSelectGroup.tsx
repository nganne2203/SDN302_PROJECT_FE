import { useEffect } from 'react'
import { SelectField } from '@/components/common'
import useVietnamLocations from '@/hooks/useVietnamLocations'

type LocationChange = Partial<{
  province: string
  ward: string
  provinceCode: number | undefined
  wardCode: number | undefined
}>

// eslint-disable-next-line no-unused-vars
type LocationChangeHandler = (changes: LocationChange) => void

interface LocationSelectGroupProps {
  provinceCode?: number
  wardCode?: number
  onChange: LocationChangeHandler
  disabled?: boolean
}

const LocationSelectGroup = ({
  provinceCode,
  wardCode,
  onChange,
  disabled = false
}: LocationSelectGroupProps) => {
  const {
    provinceOptions,
    wardOptions,
    loading,
    fetchProvinces,
    fetchWardsByProvince,
    clearWards
  } = useVietnamLocations()

  useEffect(() => {
    fetchProvinces('')
  }, [fetchProvinces])

  useEffect(() => {
    if (provinceCode) {
      fetchWardsByProvince(provinceCode, '')
    }
  }, [provinceCode, fetchWardsByProvince])

  const handleProvinceChange = (value?: number) => {
    const selected = provinceOptions.find((item) => item.value === value)
    onChange({
      province: selected?.label || '',
      provinceCode: value,
      ward: '',
      wardCode: undefined
    })
    clearWards()
    if (value) {
      void fetchWardsByProvince(value, '')
    }
  }

  const handleWardChange = (value?: number) => {
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
        value={provinceCode}
        options={provinceOptions}
        showSearch
        filterOption={false}
        loading={loading.provinces}
        onSearch={(value) => fetchProvinces(value)}
        onChange={(value) => handleProvinceChange(value as number | undefined)}
        disabled={disabled}
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
          if (provinceCode) fetchWardsByProvince(provinceCode, value)
        }}
        onChange={(value) => handleWardChange(value as number | undefined)}
        disabled={disabled || !provinceCode}
        allowClear
      />
    </div>
  )
}

export default LocationSelectGroup
