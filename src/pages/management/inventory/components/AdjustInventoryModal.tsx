/* eslint-disable no-unused-vars */
import { useEffect } from 'react'
import { Button } from 'antd'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ModalCommon from '@/components/common/ModalCommon'
import { ControlledField, NumberField } from '@/components/common'

const adjustInventorySchema = z.object({
  quantity: z.coerce.number().refine((val) => val !== 0, {
    message: 'So luong dieu chinh phai khac 0'
  })
})

export type AdjustInventoryFormValues = z.infer<typeof adjustInventorySchema>

interface AdjustInventoryModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  currentQuantity: number
  onSubmit: (values: AdjustInventoryFormValues) => void | Promise<void>
  isSubmitting?: boolean
}

const AdjustInventoryModal = ({
  isOpen,
  onClose,
  productName,
  currentQuantity,
  onSubmit,
  isSubmitting = false
}: AdjustInventoryModalProps) => {
  const { control, handleSubmit, reset } = useForm<AdjustInventoryFormValues>({
    resolver: zodResolver(adjustInventorySchema) as Resolver<AdjustInventoryFormValues>,
    defaultValues: { quantity: 0 }
  })

  const adjustValue = useWatch({ control, name: 'quantity' })
  const previewQuantity = currentQuantity + (adjustValue || 0)

  useEffect(() => {
    if (isOpen) {
      reset({ quantity: 0 })
    }
  }, [isOpen, reset])

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title="Dieu chinh ton kho"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={isSubmitting}>
            Huy
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
          >
            Xac nhan
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-500">San pham</p>
          <p className="font-medium">{productName}</p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-500">So luong hien tai</p>
          <p className="text-lg font-semibold">{currentQuantity}</p>
        </div>

        <form className="space-y-2">
          <ControlledField
            name="quantity"
            control={control}
            render={({ value, onChange, error }) => (
              <NumberField
                label="So luong dieu chinh (+ nhap them, - xuat bot)"
                value={value as number | undefined}
                onChange={(next) => onChange(next)}
                error={error}
                placeholder="Vi du: 50 hoac -20"
                required
              />
            )}
          />
        </form>

        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-gray-500">So luong sau dieu chinh</p>
          <p className={`text-lg font-semibold ${previewQuantity < 0 ? 'text-red-500' : 'text-green-600'}`}>
            {previewQuantity}
          </p>
        </div>
      </div>
    </ModalCommon>
  )
}

export default AdjustInventoryModal
