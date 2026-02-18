import { ModalCommon, ButtonCommon, InputField } from '@/components/common'
import type { DeviceFormData } from '@/hooks/useDevice'

interface DeviceModalProps {
  isOpen: boolean
  isEditMode: boolean
  formData: DeviceFormData
  formErrors: Record<string, string>
  isSubmitting: boolean
  onClose: () => void
  onFormChange: (field: string, value: string) => void
  onSubmit: () => void
}

const DeviceModalComponent = ({
  isOpen,
  isEditMode,
  formData,
  formErrors,
  isSubmitting,
  onClose,
  onFormChange,
  onSubmit
}: DeviceModalProps) => {
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
        <InputField
          label="Ten thiet bi"
          placeholder="Nhap ten thiet bi..."
          required
          value={formData.name}
          onChange={(e) => onFormChange('name', e.target.value)}
          error={formErrors.name}
        />
        <InputField
          label="Loai"
          placeholder="Nhap loai thiet bi..."
          required
          value={formData.type}
          onChange={(e) => onFormChange('type', e.target.value)}
          error={formErrors.type}
        />
        <InputField
          label="Thuong hieu"
          placeholder="Nhap thuong hieu..."
          required
          value={formData.brand}
          onChange={(e) => onFormChange('brand', e.target.value)}
          error={formErrors.brand}
        />
        <InputField
          label="Model"
          placeholder="Nhap model..."
          required
          value={formData.model}
          onChange={(e) => onFormChange('model', e.target.value)}
          error={formErrors.model}
        />
      </div>
    </ModalCommon>
  )
}

export default DeviceModalComponent
