import { useMemo } from 'react'
import { Input, Select } from 'antd'
import { ModalCommon, ButtonCommon } from '@/components/common'
import type { BranchFormData } from '@/hooks/useBranch'
import type { User } from '@/features/user/userTypes'

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
  onSubmit
}: BranchModalProps) => {
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Quản lý (tuỳ chọn)</label>
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
  )
}

export default BranchModalComponent

