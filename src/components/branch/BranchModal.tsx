import React, { useState } from 'react'
import { ModalCommon, ButtonCommon } from '@/components/common'
import { Input } from 'antd'
import LocationSelectGroupOffline from '@/components/common/LocationSelectGroupOffline'
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

  // Simple address parsing function
  const parseAddress = (fullAddress: string): AddressComponents => {
    // Simple parsing - just put everything in addressLine for now
    // Could be enhanced to parse components from existing address
    return { addressLine: fullAddress }
  }

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