import React, { useState } from 'react'
import { ModalCommon, ButtonCommon } from '@/components/common'
import { Input } from 'antd'
import LocationSelectGroupOffline from '@/components/common/LocationSelectGroupOffline'
import { vietnamAddressService } from '@/services/vietnamAddressService'
import { combineAddress, type AddressComponents } from '@/utils/addressHelper'

interface ExtendedBranchFormData {
  name: string
  addressLine: string
  city: string
  ward: string
  provinceCode?: string
  wardCode?: string
}

/* eslint-disable no-unused-vars */
interface BranchModalOfflineProps {
  isOpen: boolean
  isEditMode: boolean
  canManage?: boolean
  initialData?: {
    name: string
    address: string // Combined address from backend
  }
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: { name: string; address: string }) => void
}

const normalizeVietnameseText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

const findProvinceByName = (provinceName: string) => {
  if (!provinceName) return undefined

  const normalizedInput = normalizeVietnameseText(provinceName)
  const provinces = vietnamAddressService.getProvinces()

  const byCode = provinces.find((province) => {
    const rawInput = provinceName.trim()
    return province.province_code === rawInput || province.code.toLowerCase() === rawInput.toLowerCase()
  })
  if (byCode) return byCode

  return (
    provinces.find((province) => normalizeVietnameseText(province.name) === normalizedInput) ||
    provinces.find((province) => {
      const normalizedProvinceName = normalizeVietnameseText(province.name)
      return (
        normalizedProvinceName.includes(normalizedInput) ||
        normalizedInput.includes(normalizedProvinceName)
      )
    })
  )
}

const findWardByName = (wardName: string, provinceCode?: string) => {
  if (!wardName) return undefined

  const normalizedInput = normalizeVietnameseText(wardName)
  const wards = provinceCode
    ? vietnamAddressService.getWardsByProvinceCode(provinceCode)
    : vietnamAddressService
      .getProvinces()
      .flatMap((province) => vietnamAddressService.getWardsByProvinceCode(province.province_code))

  const byCode = wards.find((ward) => ward.ward_code === wardName.trim())
  if (byCode) return byCode

  return (
    wards.find((ward) => normalizeVietnameseText(ward.name) === normalizedInput) ||
    wards.find((ward) => {
      const normalizedWardName = normalizeVietnameseText(ward.name)
      return normalizedWardName.includes(normalizedInput) || normalizedInput.includes(normalizedWardName)
    })
  )
}

// Parse with rule: last two comma-separated segments are ward and province.
const parseAddress = (fullAddress: string): AddressComponents => {
  if (!fullAddress?.trim()) return {}

  const segments = fullAddress
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

  if (segments.length === 0) return {}

  if (segments.length === 1) {
    return { addressLine: segments[0] }
  }

  if (segments.length === 2) {
    const addressLine = segments[0]
    const lastSegment = segments[1]

    const ward = findWardByName(lastSegment)
    if (ward) {
      const province = vietnamAddressService.getProvinceByCode(ward.province_code)
      return {
        addressLine,
        city: province?.name || '',
        provinceCode: province?.province_code,
        ward: ward.name,
        wardCode: ward.ward_code
      }
    }

    const province = findProvinceByName(lastSegment)
    return {
      addressLine,
      city: province?.name || lastSegment,
      provinceCode: province?.province_code,
      ward: '',
      wardCode: undefined
    }
  }

  const provinceName = segments[segments.length - 1]
  const wardName = segments[segments.length - 2]
  const addressLine = segments.slice(0, -2).join(', ')

  const province = findProvinceByName(provinceName)
  const ward = findWardByName(wardName, province?.province_code)
  const fallbackProvince =
    province ||
    (ward?.province_code ? vietnamAddressService.getProvinceByCode(ward.province_code) : undefined)

  return {
    addressLine,
    city: fallbackProvince?.name || provinceName,
    provinceCode: fallbackProvince?.province_code,
    ward: ward?.name || wardName,
    wardCode: ward?.ward_code
  }
}

const BranchModalComponent = ({
  isOpen,
  isEditMode,
  canManage = true,
  initialData,
  isSubmitting,
  onClose,
  onSubmit
}: BranchModalOfflineProps) => {
  const [formData, setFormData] = useState<ExtendedBranchFormData>({
    name: initialData?.name || '',
    addressLine: '',
    city: '',
    ward: '',
    provinceCode: undefined,
    wardCode: undefined
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when modal opens or initialData changes
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Parse existing address if editing
        const addressComponents = parseAddress(initialData.address)
        setFormData({
          name: initialData.name,
          addressLine: addressComponents.addressLine || '',
          city: addressComponents.city || '',
          ward: addressComponents.ward || '',
          provinceCode: addressComponents.provinceCode,
          wardCode: addressComponents.wardCode
        })
      } else {
        // Reset form for new branch
        setFormData({
          name: '',
          addressLine: '',
          city: '',
          ward: '',
          provinceCode: undefined,
          wardCode: undefined
        })
      }
      setErrors({})
    }
  }, [isOpen, initialData])

  const handleFieldChange = (field: keyof ExtendedBranchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleLocationChange = (changes: Partial<AddressComponents>) => {
    setFormData(prev => ({
      ...prev,
      ...changes
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Tên chi nhánh không được để trống'
    }

    if (!formData.addressLine.trim() && !formData.city.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ hoặc chọn tỉnh/thành phố'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const combinedAddress = combineAddress({
      addressLine: formData.addressLine,
      ward: formData.ward,
      city: formData.city
    })

    onSubmit({
      name: formData.name.trim(),
      address: combinedAddress
    })
  }

  const footer = (
    <div className="flex justify-end gap-2">
      <ButtonCommon variant="secondary" onClick={onClose} disabled={isSubmitting}>
        Hủy
      </ButtonCommon>
      <ButtonCommon
        variant="primary"
        onClick={handleSubmit}
        isLoading={isSubmitting}
        disabled={!canManage}
      >
        {isEditMode ? 'Lưu thay đổi' : 'Tạo chi nhánh'}
      </ButtonCommon>
    </div>
  )

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Cập nhật chi nhánh' : 'Tạo chi nhánh mới'}
      size="lg"
      footer={footer}
      maskClosable={false}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên chi nhánh <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="Nhập tên chi nhánh"
            status={errors.name ? 'error' : ''}
            disabled={!canManage}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ cụ thể
          </label>
          <Input
            value={formData.addressLine}
            onChange={(e) => handleFieldChange('addressLine', e.target.value)}
            placeholder="Số nhà, tên đường (VD: 123 Nguyễn Trãi)"
            disabled={!canManage}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Chọn tỉnh/thành phố, quận/huyện, phường/xã
          </label>
          <LocationSelectGroupOffline
            provinceCode={formData.provinceCode}
            wardCode={formData.wardCode}
            onChange={handleLocationChange}
            disabled={!canManage}
          />
          {errors.address && <p className="mt-2 text-sm text-red-500">{errors.address}</p>}
        </div>
      </div>
    </ModalCommon>
  )
}

export default BranchModalComponent