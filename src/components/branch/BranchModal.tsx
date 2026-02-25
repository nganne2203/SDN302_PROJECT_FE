import { Input } from 'antd'
import { ModalCommon, ButtonCommon } from '@/components/common'
import type { BranchFormData } from '@/hooks/useBranch'

/* eslint-disable no-unused-vars */
interface BranchModalProps {
  isOpen: boolean
  isEditMode: boolean
  canManage?: boolean
  formData: BranchFormData
  formErrors: Record<string, string>
  isSubmitting: boolean
  onClose: () => void
  onFormChange: (field: keyof BranchFormData, value: string) => void
  onSubmit: () => void
}

const BranchModalComponent = ({
  isOpen,
  isEditMode,
  canManage = true,
  formData,
  formErrors,
  isSubmitting,
  onClose,
  onFormChange,
  onSubmit
}: BranchModalProps) => {
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
      </div>
    </ModalCommon>
  )
}

export default BranchModalComponent

