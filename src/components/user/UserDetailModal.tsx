import { ModalCommon, ButtonCommon } from '@/components/common'
import type { User } from '@/features/user/userTypes'
import type { Branch } from '@/features/branch/branchTypes'
import dayjs from 'dayjs'
import { ROLE_LABELS } from '@/constants/constant'
import {
  Mail,
  Phone,
  User as UserIcon,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Building2
} from 'lucide-react'
import { useBranch } from '@/hooks/useBranch'
import { useEffect, useState } from 'react'

/* eslint-disable no-unused-vars */
interface UserDetailModalProps {
  isOpen: boolean;
  user?: User | null;
  onClose: () => void;
  onEdit?: (user: User) => void;
}

const DetailRow = ({
  icon: Icon,
  label,
  value,
  valueClassName = ''
}: {
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
  valueClassName?: string;
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
      <Icon className="w-5 h-5 text-blue-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p
        className={`text-base font-medium text-gray-900 wrap-break-word ${valueClassName}`}
      >
        {value || '-'}
      </p>
    </div>
  </div>
)

const UserDetailModal = ({
  isOpen,
  user,
  onClose,
  onEdit
}: UserDetailModalProps) => {
  const { fetchBranchById } = useBranch()
  const [branchInfo, setBranchInfo] = useState<Branch | null>(null)

  useEffect(() => {
    if (isOpen && user?.branch) {
      // Fetch specific branch by ID
      fetchBranchById(user.branch).then((result) => {
        if (result.type && result.type.includes('fulfilled')) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setBranchInfo((result as any).payload as Branch)
        }
      })
    }
  }, [isOpen, user?.branch, fetchBranchById])

  if (!user) {
    return (
      <ModalCommon
        isOpen={isOpen}
        onClose={onClose}
        title="Chi tiết người dùng"
        size="lg"
      >
        <div className="p-4 text-center text-gray-500">
          Không có dữ liệu người dùng
        </div>
      </ModalCommon>
    )
  }

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết người dùng"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <ButtonCommon variant="outline" onClick={onClose}>
            Đóng
          </ButtonCommon>
          {onEdit && user && (
            <ButtonCommon variant="primary" onClick={() => onEdit(user)}>
              Chỉnh sửa
            </ButtonCommon>
          )}
        </div>
      }
    >
      <div className="space-y-1">
        {/* Avatar and Basic Info */}
        <div className="flex items-center gap-4 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg mb-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullname}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-white shadow-lg">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {user.fullname}
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {ROLE_LABELS[user.role]}
              </span>
              {user.isActive ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3" />
                  Hoạt động
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <XCircle className="w-3 h-3" />
                  Vô hiệu hóa
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Thông tin liên hệ
          </h4>
          <DetailRow icon={Mail} label="Email" value={user.email} />
          <DetailRow
            icon={Phone}
            label="Số điện thoại"
            value={user.phone || 'Chưa cập nhật'}
          />
        </div>
        {user.branch && (
          <DetailRow
            icon={Building2}
            label="Chi nhánh"
            value={
              branchInfo
                ? `${branchInfo.name} - ${branchInfo.address}`
                : user.branch
            }
          />
        )}

        {/* Account Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Thông tin tài khoản
          </h4>
          <DetailRow
            icon={Shield}
            label="Vai trò"
            value={ROLE_LABELS[user.role]}
          />
          <DetailRow
            icon={UserIcon}
            label="Phương thức đăng ký"
            value={
              user.provider === 'google' ? (
                <span className="inline-flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full">
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </span>
                  Google
                </span>
              ) : (
                <span>Email/Password</span>
              )
            }
          />
          <DetailRow
            icon={CheckCircle}
            label="Email đã xác thực"
            value={
              user.isEmailVerified ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Đã xác thực
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Chưa xác thực
                </span>
              )
            }
          />
        </div>

        {/* Timestamps */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Thời gian
          </h4>
          <DetailRow
            icon={Calendar}
            label="Ngày tạo"
            value={dayjs(user.createdAt).format('DD/MM/YYYY HH:mm:ss')}
          />
          <DetailRow
            icon={Calendar}
            label="Cập nhật gần nhất"
            value={dayjs(user.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
          />
          {user.emailVerifiedAt && (
            <DetailRow
              icon={Calendar}
              label="Ngày xác thực email"
              value={dayjs(user.emailVerifiedAt).format('DD/MM/YYYY HH:mm:ss')}
            />
          )}
        </div>

        {/* Addresses */}
        {user.addresses && user.addresses.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Địa chỉ
            </h4>
            <div className="space-y-3">
              {user.addresses.map((address, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900">
                      {address.fullname}
                    </p>
                    {address.isDefault && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                  <p className="text-sm text-gray-600">
                    {address.addressLine}, {address.ward}, {address.district},{' '}
                    {address.city}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModalCommon>
  )
}

export default UserDetailModal