import { ModalCommon, ButtonCommon, InputField, TextAreaField, ControlledField } from '@/components/common'
import type { Control } from 'react-hook-form'
import type { CategoryFormData } from '@/hooks/useCategory'

interface CategoryModalProps {
  isOpen: boolean
  isEditMode: boolean
  isSubmitting: boolean
  control: Control<CategoryFormData>
  onClose: () => void
  onSubmit: () => void
}

const CategoryModalComponent = ({
  isOpen,
  isEditMode,
  isSubmitting,
  control,
  onClose,
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
        <ControlledField<CategoryFormData>
          name="name"
          control={control}
          render={({ value, onChange, onBlur, error }) => (
            <InputField
              label="Tên danh mục"
              placeholder="Nhập tên danh mục..."
              required
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
            />
          )}
        />

        <ControlledField<CategoryFormData>
          name="description"
          control={control}
          render={({ value, onChange, onBlur, error }) => (
            <TextAreaField
              label="Mô tả"
              placeholder="Nhập mô tả danh mục..."
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
              rows={4}
            />
          )}
        />
      </div>
    </ModalCommon>
  )
}

export default CategoryModalComponent
