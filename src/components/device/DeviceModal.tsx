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
      title={isEditMode ? 'Chinh sua thiet bi' : 'Them thiet bi moi'}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <ButtonCommon
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Huy
          </ButtonCommon>
          <ButtonCommon
            variant="primary"
            onClick={onSubmit}
            isLoading={isSubmitting}
          >
            {isEditMode ? 'Cap nhat' : 'Tao moi'}
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
              label="Ten thiet bi"
              placeholder="Nhap ten thiet bi..."
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
              label="Loai"
              placeholder="Chon loai thiet bi..."
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
              label="Thuong hieu"
              placeholder="Nhap thuong hieu..."
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
              placeholder="Nhap model..."
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
