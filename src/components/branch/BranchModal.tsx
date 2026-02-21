import { useMemo, useState } from 'react'
import { Input, Select, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { ModalCommon, ButtonCommon } from '@/components/common'
import type { BranchFormData } from '@/hooks/useBranch'
import type { User } from '@/features/user/userTypes'
import type { UserRole } from '@/types/api'
import { USER_ROLES } from '@/constants/constant'
import { useUserManagement } from '@/hooks/useUserManagement'
import { toast } from '@/utils/toast'
import { stripLocationCodesFromList } from '@/utils/address'
import UserFormModal from '@/components/user/UserFormModal'

/* eslint-disable no-unused-vars */
interface BranchModalProps {
  isOpen: boolean
  isEditMode: boolean
  canManage?: boolean
  managers: User[]
  formData: BranchFormData
  formErrors: Record<string, string>
  isSubmitting: boolean
  onClose: () => void
  onFormChange: (field: keyof BranchFormData, value: string) => void
  onManagerChange: (managerId: string | null) => void
  onSubmit: () => void
  onManagerCreated?: () => void
}

const BranchModalComponent = ({
  isOpen,
  isEditMode,
  canManage = true,
  managers,
  formData,
  formErrors,
  isSubmitting,
  onClose,
  onFormChange,
  onManagerChange,
  onSubmit,
  onManagerCreated
}: BranchModalProps) => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const { createUser, actionLoading } = useUserManagement()
  const handleCreateManager = async (userData: {
    fullname: string
    email: string
    password: string
    phone: string
    role: UserRole
    branch: string
    avatar: string
    addresses: Array<{
      fullname: string
      phone: string
      addressLine: string
      city: string
      district: string
      ward: string
      isDefault: boolean
    }>
  }) => {
    try {
      const sanitizedAddresses = userData.addresses.length > 0
        ? stripLocationCodesFromList(userData.addresses)
        : undefined
      const result = await createUser({
        fullname: userData.fullname,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || undefined,
        role: userData.role,
        branch: userData.branch || undefined,
        avatar: userData.avatar || undefined,
        addresses: sanitizedAddresses
      })

      if (result.type.includes('fulfilled')) {
        toast.success('Tạo quản lý thành công')
        setIsUserModalOpen(false)
        onManagerCreated?.()
      } else if (result.payload) {
        toast.error(result.payload as string)
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi tạo quản lý')
    }
  }

  const managerOptions = useMemo(
    () =>
      managers.map((m) => ({
        value: m._id,
        label: `${m.fullname} (${m.email})`
      })),
    [managers]
  )

  const footer = (
    <div className="flex justify-end gap-2">
      <ButtonCommon variant="secondary" onClick={onClose} disabled={isSubmitting}>
        Hủy
      </ButtonCommon>
      <ButtonCommon variant="primary" onClick={onSubmit} isLoading={isSubmitting} disabled={!canManage}>
        {isEditMode ? 'Lưu thay đổi' : 'Tạo chi nhánh'}
      </ButtonCommon>
    </div>
  )

  return (
    <>
      <ModalCommon
        isOpen={isOpen}
        onClose={onClose}
        title={isEditMode ? 'Cập nhật chi nhánh' : 'Tạo chi nhánh mới'}
        size="md"
        footer={footer}
        maskClosable={false}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên chi nhánh <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              placeholder="Nhập tên chi nhánh"
              status={formErrors.name ? 'error' : ''}
              disabled={!canManage}
            />
            {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.address}
              onChange={(e) => onFormChange('address', e.target.value)}
              placeholder="Nhập địa chỉ"
              status={formErrors.address ? 'error' : ''}
              disabled={!canManage}
            />
            {formErrors.address && <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Quản lý (tuỳ chọn)</label>
              {canManage && (
                <Button
                  type="link"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setIsUserModalOpen(true)}
                >
                  Tạo quản lý
                </Button>
              )}
            </div>
            <Select
              allowClear
              showSearch
              placeholder="Chọn quản lý"
              options={managerOptions}
              value={formData.manager || undefined}
              onChange={(val) => onManagerChange((val as string) || null)}
              disabled={!canManage}
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: '100%' }}
            />
            {formErrors.manager && <p className="mt-1 text-sm text-red-500">{formErrors.manager}</p>}
          </div>
        </div>
      </ModalCommon>

      <UserFormModal
        isOpen={isUserModalOpen}
        isEditMode={false}
        isSubmitting={actionLoading}
        defaultRole={USER_ROLES.MANAGER as UserRole}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleCreateManager}
      />
    </>
  )
}

export default BranchModalComponent

