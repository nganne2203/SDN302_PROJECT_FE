import { Modal, Spin } from 'antd'
import { userProfileSchema, type ProfileFormData } from '@/utils/validator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { useCallback, useEffect, useState, useRef } from 'react'
import toast from '@/utils/toast'
import useUser from '@/hooks/useUser'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import { setCredentials } from '@/features/auth/authSlices'
import ProfileHeader from './ProfileHeader'
import ProfileContentLeft from './ProfileContentLeft'
import ProfileContentRight from './ProfileContentRight'
import uploadApi from '@/apis/upload'
import type { UpdateProfilePayload } from '@/features/user/userTypes'
import { vietnamAddressService } from '@/services/vietnamAddressService'
import { getAvatarUrl } from '@/utils/getAvatar'

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const normalizeLocationName = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^thanh pho\s+|^tinh\s+/i, '')
    .trim()
}

const ProfileModalComponent = ({ isOpen, onClose }: ProfileModalProps) => {
  const { profile, updateProfile, isLoading, fetchProfile } = useUser()
  const dispatch = useAppDispatch()
  const { accessToken, refreshToken } = useAppSelector((state) => state.auth)
  const [isEditMode, setIsEditMode] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const prevIsOpenRef = useRef(isOpen)
  const { control, handleSubmit, setValue, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(userProfileSchema)
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses'
  })

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      fetchProfile()
    }
    if (!isOpen && prevIsOpenRef.current) {
      setIsEditMode(false)
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, fetchProfile])

  useEffect(() => {
    if (!profile) return

    const rawAddresses = profile.addresses || []
    const provinces = vietnamAddressService.getProvinces()

    const hydratedAddresses = rawAddresses.map((address) => {
      if (!address.city || !address.ward) {
        return address
      }

      const matchedProvince = provinces.find((province) =>
        normalizeLocationName(province.name) === normalizeLocationName(address.city)
      )

      if (!matchedProvince) {
        return address
      }

      const wards = vietnamAddressService.getWardsByProvinceCode(matchedProvince.province_code)
      const matchedWard = wards.find((ward) =>
        normalizeLocationName(ward.name) === normalizeLocationName(address.ward)
      )

      return {
        ...address,
        provinceCode: matchedProvince.province_code,
        wardCode: matchedWard?.ward_code
      }
    })

    reset({
      fullname: profile.fullname || '',
      email: profile.email,
      phone: profile.phone || '',
      addresses: hydratedAddresses,
      avatar: profile.avatarId || ''
    })
    setAvatarPreview(profile.avatar)

    if (profile && accessToken && refreshToken) {
      dispatch(setCredentials({
        user: profile,
        accessToken,
        refreshToken
      }))
    }
  }, [profile, reset, dispatch, accessToken, refreshToken])

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      try {
        setUploadingAvatar(true)
        const response = await uploadApi.uploadImage(file)
        let { publicId } = response.data
        const { imageUrl } = response.data

        if (publicId.startsWith('uploads/')) {
          publicId = publicId.replace(/^uploads\//, '')
        }

        setValue('avatar', publicId)
        setAvatarPreview(imageUrl)
        toast.success('Tải ảnh thành công')
      } catch {
        toast.error('Tải ảnh thất bại, vui lòng thử lại')
        return false
      } finally {
        setUploadingAvatar(false)
      }

      return false
    },
    [setValue]
  )

  const onSubmit = useCallback(
    async (data: ProfileFormData) => {
      const payload: UpdateProfilePayload = {
        fullname: data.fullname,
        phone: data.phone,
        avatar: data.avatar || undefined,
        addresses: (data.addresses || []).map((address) => ({
          fullname: address.fullname,
          phone: address.phone,
          addressLine: address.addressLine,
          city: address.city,
          ward: address.ward,
          isDefault: Boolean(address.isDefault)
        }))
      }

      const result = await updateProfile(payload)

      if (result.success) {
        setIsEditMode(false)
        toast.success('Cập nhật thông tin thành công')
        fetchProfile()
      } else {
        toast.error(result.error || 'Cập nhật thông tin thất bại')
      }
    },
    [updateProfile, fetchProfile]
  )

  const handleButtonClick = () => {
    if (isEditMode) {
      handleSubmit(onSubmit, (errors) => {
        // Show first validation error as toast
        const firstError = Object.values(errors).flat()[0]
        if (firstError && 'message' in firstError && firstError.message) {
          toast.error(firstError.message as string)
        } else if (errors.addresses) {
          // Check nested address errors
          const addrErrors = errors.addresses as Record<string, unknown>
          for (const key of Object.keys(addrErrors)) {
            const fieldErrors = addrErrors[key] as Record<string, { message?: string }>
            if (fieldErrors) {
              const msg = Object.values(fieldErrors).find((e) => e?.message)?.message
              if (msg) {
                toast.error(msg)
                return
              }
            }
          }
        }
      })()
    } else {
      setIsEditMode(true)
    }
  }
  return (
    <Modal
      title='Hồ sơ cá nhân'
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
    >
      {isLoading ? (
        <div className='flex items-center justify-center py-10'>
          <Spin size='large' />
        </div>
      ) : (
        <div className='max-w-5xl mx-auto'>
          <ProfileHeader
            isLoading={isLoading}
            onSubmit={handleButtonClick}
            isEditMode={isEditMode}
          />

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto h-[calc(60vh)]'>
            <ProfileContentLeft
              control={control}
              disabled={!isEditMode}
              avatarUrl={getAvatarUrl(profile, avatarPreview)}
              onAvatarUpload={handleAvatarUpload}
              uploading={uploadingAvatar}
            />
            <ProfileContentRight
              control={control}
              fields={fields}
              append={append}
              remove={remove}
              setValue={setValue}
              disabled={!isEditMode}
            />
          </div>
        </div>
      )}
    </Modal>
  )
}

export default ProfileModalComponent
