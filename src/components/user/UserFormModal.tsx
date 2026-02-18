import { useState, useEffect } from 'react'
import { ModalCommon, ButtonCommon, InputField, SelectField, CheckboxField, LocationSelectGroup } from '@/components/common'
import { Button, Divider } from 'antd'
import { Plus, Trash2, MapPin } from 'lucide-react'
import type { User, Address } from '@/features/user/userTypes'
import type { Branch, UserRole } from '@/types/api'
import { USER_ROLES, ROLE_LABELS } from '@/constants/constant'
import { emailSchema, passwordSchema, fullNameSchema, userAddressSchema } from '@/utils/validator'
import { useBranch } from '@/hooks/useBranch'
interface UserFormData {
  fullname: string
  email: string
  password: string
  phone: string
  role: UserRole
  branch: string
  avatar: string
  addresses: Address[]
}

/* eslint-disable no-unused-vars */
interface UserFormModalProps {
  isOpen: boolean
  isEditMode: boolean
  user?: User | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: UserFormData) => void
}

const emptyAddress: Address = {
  fullname: '',
  phone: '',
  addressLine: '',
  city: '',
  district: '',
  ward: '',
  provinceCode: undefined,
  districtCode: undefined,
  wardCode: undefined,
  isDefault: false
}

const UserFormModal = ({
  isOpen,
  isEditMode,
  user,
  isSubmitting,
  onClose,
  onSubmit
}: UserFormModalProps) => {
  const getInitialFormData = (): UserFormData => {
    if (isEditMode && user) {
      return {
        fullname: user.fullname || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        role: user.role || USER_ROLES.CUSTOMER as UserRole,
        branch: user.branch || '',
        avatar: user.avatar || '',
        addresses: user.addresses?.length > 0 ? user.addresses : []
      }
    }
    return {
      fullname: '',
      email: '',
      password: '',
      phone: '',
      role: USER_ROLES.CUSTOMER as UserRole,
      branch: '',
      avatar: '',
      addresses: []
    }
  }

  const [formData, setFormData] = useState<UserFormData>(getInitialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData | string, string>>>({})
  const { branches, fetchBranchesAll } = useBranch()

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData())
      setErrors({})
      // Fetch branches for dropdown
      fetchBranchesAll({ isActive: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditMode, user?._id])

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddressChange = (index: number, field: keyof Address, value: string | boolean | number | undefined) => {
    const newAddresses = [...formData.addresses]
    newAddresses[index] = { ...newAddresses[index], [field]: value }

    if (field === 'isDefault' && value === true) {
      newAddresses.forEach((addr, i) => {
        if (i !== index) {
          addr.isDefault = false
        }
      })
    }

    setFormData(prev => ({ ...prev, addresses: newAddresses }))
    const errorKey = `address_${index}`
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }))
    }
  }

  const handleAddAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, { ...emptyAddress }]
    }))
  }

  const handleRemoveAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData | string, string>> = {}

    const fullnameResult = fullNameSchema.safeParse(formData.fullname)
    if (!fullnameResult.success) {
      newErrors.fullname = fullnameResult.error.issues[0]?.message
    }

    const emailResult = emailSchema.safeParse(formData.email)
    if (!emailResult.success) {
      newErrors.email = emailResult.error.issues[0]?.message
    }

    if (!isEditMode) {
      const passwordResult = passwordSchema.safeParse(formData.password)
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.issues[0]?.message
      }
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)'
    }

    if (formData.role === USER_ROLES.STAFF || formData.role === USER_ROLES.MANAGER) {
      if (!formData.branch || !formData.branch.trim()) {
        newErrors.branch = 'Vui lòng chọn chi nhánh cho nhân viên và quản lý'
      }
    }

    formData.addresses.forEach((address, index) => {
      if (address.fullname || address.phone || address.addressLine || address.city) {
        const addressResult = userAddressSchema.safeParse(address)
        if (!addressResult.success) {
          newErrors[`address_${index}`] = addressResult.error.issues[0]?.message
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      const validAddresses = formData.addresses.filter(addr =>
        addr.fullname && addr.phone && addr.addressLine && addr.city
      )
      onSubmit({ ...formData, addresses: validAddresses })
    }
  }

  const roleOptions = [
    { value: USER_ROLES.CUSTOMER, label: ROLE_LABELS[USER_ROLES.CUSTOMER] },
    { value: USER_ROLES.STAFF, label: ROLE_LABELS[USER_ROLES.STAFF] },
    { value: USER_ROLES.MANAGER, label: ROLE_LABELS[USER_ROLES.MANAGER] },
    { value: USER_ROLES.ADMIN, label: ROLE_LABELS[USER_ROLES.ADMIN] }
  ]

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
      size='xl'
      footer={
        <div className='flex justify-end gap-2'>
          <ButtonCommon
            variant='outline'
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </ButtonCommon>
          <ButtonCommon
            variant='primary'
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {isEditMode ? 'Cập nhật' : 'Tạo mới'}
          </ButtonCommon>
        </div>
      }
    >
      <div className='space-y-6 max-h-[70vh] overflow-y-auto px-1'>
        {/* Basic Information */}
        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Thông tin cơ bản</h3>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <InputField
                label='Họ và tên'
                placeholder='Nhập họ và tên...'
                required
                value={formData.fullname}
                onChange={(e) => handleChange('fullname', e.target.value)}
                error={errors.fullname}
              />

              <InputField
                label='Email'
                type='email'
                placeholder='Nhập email...'
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
              />
            </div>

            {!isEditMode && (
              <InputField
                label='Mật khẩu'
                type='password'
                placeholder='Nhập mật khẩu...'
                required
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                helpText='Mật khẩu: 8-20 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
              />
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <InputField
                label='Số điện thoại'
                type='tel'
                placeholder='Nhập số điện thoại...'
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={errors.phone}
                helpText='10-11 số'
              />

              <SelectField
                label='Vai trò'
                placeholder='Chọn vai trò...'
                required
                value={formData.role}
                onChange={(value) => handleChange('role', value as string)}
                options={roleOptions}
                error={errors.role}
              />
            </div>

            <SelectField
              label='Chi nhánh'
              placeholder='Chọn chi nhánh...'
              required={formData.role === USER_ROLES.STAFF || formData.role === USER_ROLES.MANAGER}
              value={formData.branch}
              onChange={(value) => handleChange('branch', value as string)}
              options={branches.map((branch : Branch) => ({
                value: branch._id,
                label: `${branch.name} - ${branch.address}`
              }))}
              error={errors.branch}
              helpText={
                formData.role === USER_ROLES.STAFF || formData.role === USER_ROLES.MANAGER
                  ? 'Bắt buộc phải chọn chi nhánh cho nhân viên và quản lý'
                  : 'Chọn chi nhánh cho nhân viên (tùy chọn)'
              }
            />

            <InputField
              label='URL Avatar'
              type='url'
              placeholder='https://example.com/avatar.jpg'
              value={formData.avatar}
              onChange={(e) => handleChange('avatar', e.target.value)}
              error={errors.avatar}
              helpText='Nhập đường dẫn hình ảnh đại diện (tùy chọn)'
            />
          </div>
        </div>

        <Divider className='my-6' />

        {/* Addresses Section */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
              <MapPin className='w-5 h-5 text-blue-600' />
              Địa chỉ giao hàng
            </h3>
            <Button
              type='dashed'
              icon={<Plus className='w-4 h-4' />}
              onClick={handleAddAddress}
              className='flex items-center gap-1'
            >
              Thêm địa chỉ
            </Button>
          </div>

          {formData.addresses.length === 0 ? (
            <div className='text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
              <MapPin className='w-12 h-12 text-gray-400 mx-auto mb-2' />
              <p className='text-gray-500'>Chưa có địa chỉ nào</p>
              <p className='text-sm text-gray-400 mt-1'>Nhấn 'Thêm địa chỉ' để bắt đầu</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {formData.addresses.map((address, index) => (
                <div
                  key={index}
                  className='p-4 bg-gray-50 rounded-lg border border-gray-200 relative'
                >
                  <div className='flex items-start justify-between mb-3'>
                    <h4 className='font-medium text-gray-900'>Địa chỉ {index + 1}</h4>
                    <Button
                      type='text'
                      danger
                      size='small'
                      icon={<Trash2 className='w-4 h-4' />}
                      onClick={() => handleRemoveAddress(index)}
                    />
                  </div>

                  <div className='space-y-3'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      <InputField
                        label='Họ và tên người nhận'
                        placeholder='Nhập họ và tên...'
                        value={address.fullname}
                        onChange={(e) => handleAddressChange(index, 'fullname', e.target.value)}
                        className='mb-0'
                      />
                      <InputField
                        label='Số điện thoại'
                        placeholder='Nhập số điện thoại...'
                        value={address.phone}
                        onChange={(e) => handleAddressChange(index, 'phone', e.target.value)}
                        className='mb-0'
                      />
                    </div>

                    <InputField
                      label='Địa chỉ chi tiết'
                      placeholder='Số nhà, tên đường...'
                      value={address.addressLine}
                      onChange={(e) => handleAddressChange(index, 'addressLine', e.target.value)}
                      className='mb-0'
                    />

                    <LocationSelectGroup
                      provinceCode={address.provinceCode}
                      districtCode={address.districtCode}
                      wardCode={address.wardCode}
                      onChange={(changes) => {
                        if ('province' in changes) {
                          handleAddressChange(index, 'city', changes.province || '')
                        }
                        if ('district' in changes) {
                          handleAddressChange(index, 'district', changes.district || '')
                        }
                        if ('ward' in changes) {
                          handleAddressChange(index, 'ward', changes.ward || '')
                        }
                        if ('provinceCode' in changes) {
                          handleAddressChange(index, 'provinceCode', changes.provinceCode)
                        }
                        if ('districtCode' in changes) {
                          handleAddressChange(index, 'districtCode', changes.districtCode)
                        }
                        if ('wardCode' in changes) {
                          handleAddressChange(index, 'wardCode', changes.wardCode)
                        }
                      }}
                    />

                    <CheckboxField
                      label='Đặt làm địa chỉ mặc định'
                      checked={address.isDefault}
                      onChange={(checked) => handleAddressChange(index, 'isDefault', checked)}
                      className='mb-0'
                    />

                    {errors[`address_${index}`] && (
                      <p className='text-sm text-red-500 mt-2'>
                        {errors[`address_${index}`]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalCommon>
  )
}

export default UserFormModal
