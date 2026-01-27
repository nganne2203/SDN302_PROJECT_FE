import { ModalCommon, ButtonCommon, InputField, TextAreaField } from '@/components/common'
import type { CategoryFormData } from '@/hooks/useCategory'

/* eslint-disable no-unused-vars */
interface CategoryModalProps {
  isOpen: boolean
  isEditMode: boolean
  formData: CategoryFormData
  formErrors: Record<string, string>
  isSubmitting: boolean
  onClose: () => void
  onFormChange: (field: string, value: string) => void
  onSubmit: () => void
}

const CategoryModalComponent = ({
  isOpen,
  isEditMode,
  formData,
  formErrors,
  isSubmitting,
  onClose,
  onFormChange,
  onSubmit
}: CategoryModalProps) => {
  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <ButtonCommon
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </ButtonCommon>
          <ButtonCommon
            variant="primary"
            onClick={onSubmit}
            isLoading={isSubmitting}
          >
            {isEditMode ? 'Cập nhật' : 'Tạo mới'}
          </ButtonCommon>
        </div>
      }
    >
      <div className="space-y-4">
        <InputField
          label="Tên danh mục"
          placeholder="Nhập tên danh mục..."
          required
          value={formData.name}
          onChange={(e) => onFormChange('name', e.target.value)}
          error={formErrors.name}
        />
        <TextAreaField
          label="Mô tả"
          placeholder="Nhập mô tả danh mục..."
          value={formData.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          error={formErrors.description}
          rows={4}
        />
      </div>
    </ModalCommon>
  )
}

export default CategoryModalComponent
