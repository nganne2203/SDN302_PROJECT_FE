import { ModalCommon, ButtonCommon, InputField, SelectField, ControlledField } from '@/components/common'
import type { Control } from 'react-hook-form'
import type { DeviceFormData } from '@/hooks/useDevice'
import { DEVICE_TYPES } from '@/features/device/deviceTypes'

interface DeviceModalProps {
  isOpen: boolean
  isEditMode: boolean
  isSubmitting: boolean
  control: Control<DeviceFormData>
  onClose: () => void
  onSubmit: () => void
}

const DeviceModalComponent = ({
  isOpen,
  isEditMode,
  isSubmitting,
  control,
  onClose,
  onSubmit
}: DeviceModalProps) => {
  const deviceTypeOptions = [
    { value: DEVICE_TYPES.SMARTPHONE, label: 'Smartphone' },
    { value: DEVICE_TYPES.TABLET, label: 'Tablet' }
  ]

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
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
        <ControlledField<DeviceFormData>
          name="name"
          control={control}
          render={({ value, onChange, onBlur, error }) => (
            <InputField
              label="Tên thiết bị"
              placeholder="Nhập tên thiết bị..."
              required
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
            />
          )}
        />
        <ControlledField<DeviceFormData>
          name="type"
          control={control}
          render={({ value, onChange, onBlur, error }) => (
            <SelectField
              label="Loại"
              placeholder="Chọn loại thiết bị..."
              required
              value={(value as string) || undefined}
              options={deviceTypeOptions}
              onChange={(val) => onChange(val)}
              onBlur={onBlur}
              error={error}
              allowClear
            />
          )}
        />
        <ControlledField<DeviceFormData>
          name="brand"
          control={control}
          render={({ value, onChange, onBlur, error }) => (
            <InputField
              label="Thương hiệu"
              placeholder="Nhập thương hiệu..."
              required
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
            />
          )}
        />
        <ControlledField<DeviceFormData>
          name="model"
          control={control}
          render={({ value, onChange, onBlur, error }) => (
            <InputField
              label="Model"
              placeholder="Nhập model..."
              required
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              error={error}
            />
          )}
        />
      </div>
    </ModalCommon>
  )
}

export default DeviceModalComponent
