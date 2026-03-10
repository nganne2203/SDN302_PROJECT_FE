import { useState, useEffect } from 'react'
import { ModalCommon, ButtonCommon, InputField, SelectField, CheckboxField, LocationSelectGroupOffline, UploadField } from '@/components/common'
import { Button, Divider } from 'antd'
import type { UploadProps } from 'antd'
import { Plus, Trash2, MapPin } from 'lucide-react'
import type { User, Address } from '@/features/user/userTypes'
import type { Branch, UserRole } from '@/types/api'
import { USER_ROLES, ROLE_LABELS } from '@/constants/constant'
import { emailSchema, passwordSchema, fullNameSchema, userAddressSchema } from '@/utils/validator'
import { combineAddress } from '@/utils/addressHelper'
import { useBranch } from '@/hooks/useBranch'
import uploadApi from '@/apis/upload'
import { toast } from '@/utils/toast'
import BranchModalComponent from '@/components/branch/BranchModal'
import type { BranchFormData } from '@/hooks/useBranch'
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
  defaultRole?: UserRole
  onClose: () => void
  onSubmit: (data: UserFormData) => void
}

const emptyAddress: Address = {
  fullname: '',
  phone: '',
  addressLine: '',
  city: '',
  ward: '',
  provinceCode: undefined,
  wardCode: undefined,
  isDefault: false
}

const UserFormModal = ({
  isOpen,
  isEditMode,
  user,
  isSubmitting,
  defaultRole,
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
        avatar: user.avatarId || user.avatar || '',
        addresses: user.addresses?.length > 0 ? user.addresses : []
      }
    }
    return {
      fullname: '',
      email: '',
      password: '',
      phone: '',
      role: (defaultRole || USER_ROLES.CUSTOMER) as UserRole,
      branch: '',
      avatar: '',
      addresses: []
    }
  }

  const [formData, setFormData] = useState<UserFormData>(getInitialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData | string, string>>>({})
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false)
  const [isBranchSubmitting, setIsBranchSubmitting] = useState(false)
  const [branchFormData, setBranchFormData] = useState<BranchFormData>({ name: '', address: '' })
  const { branches, fetchBranchesAll, createBranch } = useBranch()

  useEffect(() => {
    let isMounted = true

    if (isOpen) {
      const initialFormData = getInitialFormData()
      setFormData(initialFormData)
      setErrors({})
      setAvatarPreview(undefined)
      // Fetch branches for dropdown
      fetchBranchesAll({ isActive: true })

      const avatarPublicId = initialFormData.avatar
      const avatarUrl = user?.avatar

      if (avatarUrl && avatarUrl.startsWith('http')) {
        setAvatarPreview(avatarUrl)
      } else if (avatarPublicId) {
        uploadApi.getImage(avatarPublicId)
          .then((response) => {
            if (isMounted) {
              setAvatarPreview(response.data.imageUrl)
            }
          })
          .catch(() => {
            if (isMounted) {
              setAvatarPreview(undefined)
            }
          })
      }
    }

    return () => {
      isMounted = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditMode, user?._id])

  const handleAvatarUpload: UploadProps['beforeUpload'] = async (file) => {
    try {
      setIsUploadingAvatar(true)
      const response = await uploadApi.uploadImage(file as File)
      const { publicId: rawPublicId, imageUrl } = response.data
      let publicId = rawPublicId

      // Strip 'uploads/' prefix if present
      if (publicId.startsWith('uploads/')) {
        publicId = publicId.replace(/^uploads\//, '')
      }

      setFormData(prev => ({ ...prev, avatar: publicId }))
      setAvatarPreview(imageUrl)
      toast.success('Tải ảnh đại diện thành công')
    } catch {
      toast.error('Tải ảnh đại diện thất bại')
    } finally {
      setIsUploadingAvatar(false)
    }

    return false
  }

  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: '' }))
    setAvatarPreview(undefined)
  }

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
      // Filter valid addresses and combine address components
      const validAddresses = formData.addresses
        .filter(addr =>
          addr.fullname && addr.phone && (addr.addressLine || addr.city)
        )
        .map(addr => {
          // Combine address components into single address string for backend
          const combinedAddress = combineAddress({
            addressLine: addr.addressLine,
            ward: addr.ward,
            city: addr.city
          })

          return {
            ...addr,
            address: combinedAddress, // Single address field for backend
            // Keep components for potential future use
            addressLine: addr.addressLine,
            city: addr.city,
            ward: addr.ward
          }
        })

      onSubmit({ ...formData, addresses: validAddresses })
    }
  }

  const handleOpenBranchModal = () => {
    setBranchFormData({ name: '', address: '' })
    setIsBranchModalOpen(true)
  }

  const handleCloseBranchModal = () => {
    if (isBranchSubmitting) return
    setIsBranchModalOpen(false)
    setBranchFormData({ name: '', address: '' })
  }

  const handleCreateBranchInUserModal = async (data: { name: string; address: string }) => {
    if (!data.name.trim() || !data.address.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin chi nhánh')
      return
    }

    setIsBranchSubmitting(true)
    try {
      const result = await createBranch({
        name: data.name.trim(),
        address: data.address.trim()
      })

      if (result.type.includes('fulfilled')) {
        const createdBranch = result.payload as Branch
        toast.success('Tạo chi nhánh thành công')
        setFormData((prev) => ({ ...prev, branch: createdBranch._id }))
        await fetchBranchesAll({ isActive: true }, true)
        handleCloseBranchModal()
      } else if (result.payload) {
        toast.error(result.payload as string)
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi tạo chi nhánh')
    } finally {
      setIsBranchSubmitting(false)
    }
  }

  const roleOptions = [
    { value: USER_ROLES.CUSTOMER, label: ROLE_LABELS[USER_ROLES.CUSTOMER] },
    { value: USER_ROLES.STAFF, label: ROLE_LABELS[USER_ROLES.STAFF] },
    { value: USER_ROLES.MANAGER, label: ROLE_LABELS[USER_ROLES.MANAGER] },
    { value: USER_ROLES.ADMIN, label: ROLE_LABELS[USER_ROLES.ADMIN] }
  ]

  return (
    <>
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

              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                  Chi nhánh {(formData.role === USER_ROLES.STAFF || formData.role === USER_ROLES.MANAGER) && <span className='text-red-500'>*</span>}
                  </label>
                  <Button
                    type='link'
                    size='small'
                    onClick={handleOpenBranchModal}
                  >
                  Tạo chi nhánh
                  </Button>
                </div>
                <SelectField
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
              </div>

              <div>
                <UploadField
                  label='Ảnh đại diện'
                  accept='image/*'
                  showUploadList={false}
                  beforeUpload={handleAvatarUpload}
                  disabled={isUploadingAvatar || isSubmitting}
                  error={errors.avatar}
                  buttonText={isUploadingAvatar ? 'Đang tải ảnh...' : 'Tải ảnh đại diện'}
                  helpText='Chọn ảnh để upload, hệ thống tự gán avatar theo Cloudinary publicId'
                />

                {avatarPreview && (
                  <div className='mt-2 flex items-center gap-3'>
                    <img
                      src={avatarPreview}
                      alt='Avatar preview'
                      className='w-16 h-16 rounded-full object-cover border border-gray-200'
                    />
                    <Button
                      type='default'
                      size='small'
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar || isSubmitting}
                    >
                    Xóa ảnh
                    </Button>
                  </div>
                )}
              </div>
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

                      <LocationSelectGroupOffline
                        provinceCode={address.provinceCode}
                        wardCode={address.wardCode}
                        onChange={(changes) => {
                          if ('province' in changes) {
                            handleAddressChange(index, 'city', changes.province || '')
                          }
                          if ('ward' in changes) {
                            handleAddressChange(index, 'ward', changes.ward || '')
                          }
                          if ('provinceCode' in changes) {
                            handleAddressChange(index, 'provinceCode', changes.provinceCode)
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

      <BranchModalComponent
        isOpen={isBranchModalOpen}
        isEditMode={false}
        canManage
        initialData={{ name: branchFormData.name, address: branchFormData.address }}
        isSubmitting={isBranchSubmitting}
        onClose={handleCloseBranchModal}
        onSubmit={handleCreateBranchInUserModal}
      />
    </>
  )
}

export default UserFormModal
