/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { ModalCommon, ButtonCommon, NumberField, SelectField, InputField } from '@/components/common'

interface ProductOption {
  label: string
  value: string
}

export interface BulkTierForm {
  minQuantity: number
  maxQuantity: number | null
  pricePerUnit: number
  discountPercentage?: number
  description?: string
}

interface PricingBulkModalProps {
  isOpen: boolean
  isSubmitting: boolean
  productOptions: ProductOption[]
  onClose: () => void
  onSubmit: (productId: string, tiers: BulkTierForm[]) => void
}

const defaultTier: BulkTierForm = {
  minQuantity: 1,
  maxQuantity: null,
  pricePerUnit: 0,
  discountPercentage: undefined,
  description: ''
}

const PricingBulkModal = ({
  isOpen,
  isSubmitting,
  productOptions,
  onClose,
  onSubmit
}: PricingBulkModalProps) => {
  const [productId, setProductId] = useState('')
  const [tiers, setTiers] = useState<BulkTierForm[]>([defaultTier])

  const handleClose = () => {
    setProductId('')
    setTiers([defaultTier])
    onClose()
  }

  const handleTierChange = (index: number, field: keyof BulkTierForm, value: string | number | null) => {
    setTiers((prev) => prev.map((tier, idx) => {
      if (idx !== index) return tier
      return {
        ...tier,
        [field]: value
      }
    }))
  }

  const handleAddTier = () => {
    setTiers((prev) => [...prev, { ...defaultTier }])
  }

  const handleRemoveTier = (index: number) => {
    setTiers((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmit = () => {
    onSubmit(productId, tiers)
  }

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={handleClose}
      title="Tao bang gia hang loat"
      size="xl"
      footer={
        <div className="flex justify-end gap-2">
          <ButtonCommon variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Huy
          </ButtonCommon>
          <ButtonCommon variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            Tao bang gia
          </ButtonCommon>
        </div>
      }
    >
      <div className="space-y-4">
        <SelectField
          label="San pham"
          required
          options={productOptions}
          value={productId}
          onChange={(value) => setProductId(value as string)}
        />

        <div className="space-y-3">
          {tiers.map((tier, index) => (
            <div key={`${index}`} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Tier {index + 1}</h4>
                {tiers.length > 1 && (
                  <ButtonCommon variant="danger" size="sm" onClick={() => handleRemoveTier(index)}>
                    Xoa tier
                  </ButtonCommon>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberField
                  label="So luong toi thieu"
                  required
                  min={1}
                  value={tier.minQuantity}
                  onChange={(value) => handleTierChange(index, 'minQuantity', typeof value === 'number' ? value : 0)}
                />
                <NumberField
                  label="So luong toi da"
                  min={1}
                  value={tier.maxQuantity ?? undefined}
                  onChange={(value) => handleTierChange(index, 'maxQuantity', typeof value === 'number' ? value : null)}
                  placeholder="Bo trong neu khong gioi han"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberField
                  label="Gia moi san pham"
                  required
                  min={0}
                  value={tier.pricePerUnit}
                  onChange={(value) => handleTierChange(index, 'pricePerUnit', typeof value === 'number' ? value : 0)}
                />
                <NumberField
                  label="Giam gia (%)"
                  min={0}
                  max={100}
                  value={tier.discountPercentage ?? undefined}
                  onChange={(value) => handleTierChange(index, 'discountPercentage', typeof value === 'number' ? value : null)}
                />
              </div>

              <InputField
                label="Mo ta"
                value={tier.description || ''}
                onChange={(e) => handleTierChange(index, 'description', e.target.value)}
              />
            </div>
          ))}
        </div>

        <ButtonCommon variant="outline" onClick={handleAddTier}>
          Them tier
        </ButtonCommon>
      </div>
    </ModalCommon>
  )
}

export default PricingBulkModal
