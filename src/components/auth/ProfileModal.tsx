import { useEffect } from 'react'
import { Modal, Avatar, Spin } from 'antd'
import { User, Mail, Phone } from 'lucide-react'
import useUser from '@/hooks/useUser'
import ButtonCommon from '@/components/common/ButtonCommon'

interface ProfileModalProps {
  open: boolean
  onClose: () => void
}

const ProfileModal = ({ open, onClose }: ProfileModalProps) => {
  const { profile, isLoading, error, fetchProfile } = useUser()

  useEffect(() => {
    if (open) {
      fetchProfile()
    }
  }, [open, fetchProfile])

  return (
    <Modal
      title="Hồ sơ cá nhân"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <div className="py-4">
          <div className="flex items-start gap-4 mb-6">
            <Avatar
              size={72}
              src={profile?.avatar || undefined}
              icon={<User className="w-6 h-6" />}
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">
                {profile?.fullName || 'Tài khoản'}
              </h2>
              <p className="text-sm text-gray-500">
                Vai trò: <span className="font-semibold">{profile?.role || '-'}</span>
              </p>
            </div>

            <ButtonCommon
              type="button"
              variant="secondary"
              onClick={() => fetchProfile()}
            >
              Tải lại
            </ButtonCommon>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4" />
                <span className="font-semibold">Email</span>
              </div>
              <p className="mt-1 text-gray-800">{profile?.email || '-'}</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <span className="font-semibold">Số điện thoại</span>
              </div>
              <p className="mt-1 text-gray-800">{profile?.phoneNumber || '-'}</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default ProfileModal
