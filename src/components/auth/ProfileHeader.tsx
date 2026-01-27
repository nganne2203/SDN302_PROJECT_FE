import { Save } from 'lucide-react';
import { ButtonCommon } from '../common';

interface ProfileHeaderProps {
  isLoading: boolean;
  onSubmit: () => void;
}

const ProfileHeader = ({ isLoading, onSubmit }: ProfileHeaderProps) => {
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
        icon={<Save className='w-4 h-4' />}
      >
        Lưu thay đổi
      </ButtonCommon>
    </div>
  );
};

export default ProfileHeader;
