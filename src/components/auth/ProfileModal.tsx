import { Modal, Spin } from 'antd';
import { userProfileSchema, type ProfileFormData } from '@/utils/validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { useCallback, useEffect } from 'react';
import toast from '@/utils/toast';
import useUser from '@/hooks/useUser';
import ProfileHeader from './ProfileHeader';
import ProfileContentLeft from './ProfileContentLeft';
import ProfileContentRight from './ProfileContentRight';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModalComponent = ({ isOpen, onClose }: ProfileModalProps) => {
  const { updateProfile, profile, isLoading } = useUser();
  const { control, handleSubmit, setValue, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(userProfileSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses',
  });

  useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, []);

  const onSubmit = useCallback(
    async (data: ProfileFormData) => {
      const result = await updateProfile(data);

      if (result) {
        onClose();
        toast.success('Cập nhật thông tin thành công');
      } else {
        toast.error('Cập nhật thông tin thất bại');
      }
    },
    [updateProfile],
  );
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
          {/* Header */}
          <ProfileHeader
            isLoading={isLoading}
            onSubmit={handleSubmit(onSubmit)}
          />

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto h-[calc(60vh)]'>
            <ProfileContentLeft control={control} />
            <ProfileContentRight
              control={control}
              fields={fields}
              append={append}
              remove={remove}
              setValue={setValue}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ProfileModalComponent;
