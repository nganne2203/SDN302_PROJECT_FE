import { ModalCommon, ButtonCommon, NumberField, SelectField, TextAreaField } from '@/components/common'
import { formatCurrency } from '@/utils/formatCurrency'
import type { PricingFormData } from '@/hooks/usePricing'

interface ProductOption {
  label: string
  value: string
}

/* eslint-disable no-unused-vars */
interface PricingModalProps {
  isOpen: boolean
  isEditMode: boolean
  formData: PricingFormData
  formErrors: Record<string, string>
  isSubmitting: boolean
  productOptions: ProductOption[]
  selectedProductBasePrice: number | null
  onClose: () => void
  onFormChange: (_field: string, _value: string | number | null) => void
  onSubmit: () => void
}

const PricingModalComponent = ({
  isOpen,
  isEditMode,
  formData,
  formErrors,
  isSubmitting,
  productOptions,
  selectedProductBasePrice,
  onClose,
  onFormChange,
  onSubmit
}: PricingModalProps) => {
  const discountPct = formData.discountPercentage ?? 0
  const showDiscount = selectedProductBasePrice !== null && formData.pricePerUnit > 0

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Cập nhật bảng giá' : 'Thêm bảng giá mới'}
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
        <SelectField
          label="Sản phẩm"
          required
          options={productOptions}
          value={formData.productId}
          onChange={(value) => onFormChange('productId', value as string)}
          error={formErrors.productId}
          disabled={isEditMode}
        />
        {selectedProductBasePrice !== null && (
          <p className="text-sm text-gray-500">
            Giá gốc: <span className="font-medium text-gray-700">{formatCurrency(selectedProductBasePrice)}</span>
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberField
            label="Số lượng tối thiểu"
            required
            min={1}
            value={formData.minQuantity}
            onChange={(value) => onFormChange('minQuantity', typeof value === 'number' ? value : 0)}
            error={formErrors.minQuantity}
          />
          <NumberField
            label="Số lượng tối đa"
            min={1}
            value={formData.maxQuantity ?? undefined}
            onChange={(value) => onFormChange('maxQuantity', typeof value === 'number' ? value : null)}
            error={formErrors.maxQuantity}
            placeholder="Bỏ trống nếu không giới hạn"
          />
        </div>
        <div>
          <NumberField
            label="Giá mỗi sản phẩm (đ)"
            required
            min={0}
            value={formData.pricePerUnit}
            onChange={(value) => onFormChange('pricePerUnit', typeof value === 'number' ? value : 0)}
            error={formErrors.pricePerUnit}
          />
          {showDiscount && (
            <p className={`mt-1 text-sm font-medium ${discountPct > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              {discountPct > 0
                ? `Giảm ${discountPct}% so với giá gốc`
                : 'Không có giảm giá (bằng hoặc cao hơn giá gốc)'}
            </p>
          )}
        </div>
        <TextAreaField
          label="Mô tả"
          placeholder="Nhập mô tả..."
          value={formData.description || ''}
          onChange={(e) => onFormChange('description', e.target.value)}
          error={formErrors.description}
          rows={4}
        />
      </div>
    </ModalCommon>
  )
}

export default PricingModalComponent
