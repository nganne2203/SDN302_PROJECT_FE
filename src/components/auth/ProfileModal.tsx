import { Modal, Spin } from 'antd'
import { userProfileSchema, type ProfileFormData } from '@/utils/validator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { useCallback, useEffect, useState, useRef } from 'react'
import toast from '@/utils/toast'
import useUser from '@/hooks/useUser'
import ProfileHeader from './ProfileHeader'
import ProfileContentLeft from './ProfileContentLeft'
import ProfileContentRight from './ProfileContentRight'
import uploadApi from '@/apis/upload'
import type { UpdateProfilePayload } from '@/features/user/userTypes'

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModalComponent = ({ isOpen, onClose }: ProfileModalProps) => {
  const { profile, updateProfile, isLoading, fetchProfile } = useUser()
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
    if (profile) {
      reset({
        fullname: profile.fullname || '',
        email: profile.email,
        phone: profile.phone || '',
        addresses: profile.addresses || [],
        avatar: profile.avatarId || ''
      })
      setAvatarPreview(profile.avatar)
    }
  }, [profile, reset])

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      try {
        setUploadingAvatar(true)
        const response = await uploadApi.uploadImage(file)
        const { publicId, imageUrl } = response.data

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
        avatar: data.avatar || undefined
      }

      const result = await updateProfile(payload)

      if (result) {
        setIsEditMode(false)
        toast.success('Cập nhật thông tin thành công')
      } else {
        toast.error('Cập nhật thông tin thất bại')
      }
    },
    [updateProfile]
  )

  const handleButtonClick = () => {
    if (isEditMode) {
      handleSubmit(onSubmit)()
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
              avatarUrl={avatarPreview || profile?.avatar}
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
