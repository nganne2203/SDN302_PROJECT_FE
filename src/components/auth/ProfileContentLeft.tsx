import { Avatar, Card, Divider, Upload } from 'antd'
import { Camera, Mail, Phone, User } from 'lucide-react'
import { FieldCustom } from '../common'
import { type Control } from 'react-hook-form'
import type { ProfileFormData } from '@/utils/validator'

interface ProfileContentLeftProps {
  control: Control<ProfileFormData>;
  disabled?: boolean;
}

const ProfileContentLeft = ({ control, disabled = false }: ProfileContentLeftProps) => {
  return (
    <div className='lg:col-span-1 space-y-6'>
      <Card className='shadow-sm rounded-xl border-gray-200'>
        <div className='flex flex-col items-center pb-6'>
          <Upload
            name='avatar'
            listType='picture-circle'
            showUploadList={false}
            className='avatar-uploader'
            beforeUpload={() => false}
            //   onChange={handleAvatarChange}
          >
            <div className='relative group cursor-pointer'>
              <Avatar
                size={120}
                //   src={avatarUrl}
                icon={<User className='w-16 h-16 text-gray-400' />}
                className='border-4 border-white shadow-md transition-transform group-hover:scale-105'
              />
              <div className='absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10'>
                <Camera className='w-8 h-8 text-white' />
              </div>
            </div>
          </Upload>
          <p className='mt-4 text-sm font-medium text-gray-500'>Ảnh đại diện</p>
        </div>

        <Divider className='my-4' />

        <div className='space-y-4'>
          <FieldCustom.Controlled
            name='fullname'
            control={control}
            render={({ value, onChange, error }) => (
              <FieldCustom.Input
                label='Họ và tên'
                value={value as string}
                onChange={onChange}
                error={error}
                disabled={disabled}
                prefix={<User className='w-4 h-4 text-gray-400 mr-2' />}
              />
            )}
          />

          <FieldCustom.Controlled
            name='email'
            control={control}
            render={({ value, onChange, error }) => (
              <FieldCustom.Input
                label='Email'
                type='email'
                value={value as string}
                onChange={onChange}
                error={error}
                disabled
                prefix={<Mail className='w-4 h-4 text-gray-400 mr-2' />}
              />
            )}
          />

          <FieldCustom.Controlled
            name='phone'
            control={control}
            render={({ value, onChange, error }) => (
              <FieldCustom.Input
                label='Số điện thoại'
                value={value as string}
                onChange={onChange}
                error={error}
                disabled={disabled}
                prefix={<Phone className='w-4 h-4 text-gray-400 mr-2' />}
              />
            )}
          />
        </div>
      </Card>
    </div>
  )
}

export default ProfileContentLeft
