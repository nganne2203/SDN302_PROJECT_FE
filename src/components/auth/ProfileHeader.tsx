import { Save, Edit } from 'lucide-react'
import { ButtonCommon } from '../common'

interface ProfileHeaderProps {
  isLoading: boolean;
  onSubmit: () => void
  isEditMode: boolean;
}

const ProfileHeader = ({ isLoading, onSubmit, isEditMode }: ProfileHeaderProps) => {
  return (
    <div className='mb-6 flex items-center justify-between'>
      <div className='flex items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Chỉnh sửa hồ sơ</h1>
          <p className='text-sm text-gray-500'>
            Quản lý thông tin cá nhân và địa chỉ nhận hàng
          </p>
        </div>
      </div>
      <ButtonCommon
        onClick={onSubmit}
        isLoading={isLoading}
        icon={isEditMode ? <Save className='w-4 h-4' /> : <Edit className='w-4 h-4' />}
      >
        {isEditMode ? 'Cập nhật hồ sơ' : 'Lưu thay đổi'}
      </ButtonCommon>
    </div>
  )
}

export default ProfileHeader
