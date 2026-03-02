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
    message: 'Số lượng điều chỉnh phải khác 0'
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
      title="Điều chỉnh tồn kho"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
          >
            Xác nhận
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Sản phẩm</p>
          <p className="font-medium">{productName}</p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Số lượng hiện tại</p>
          <p className="text-lg font-semibold">{currentQuantity}</p>
        </div>

        <form className="space-y-2">
          <ControlledField
            name="quantity"
            control={control}
            render={({ value, onChange, error }) => (
              <NumberField
                label="Số lượng điều chỉnh (+ nhập thêm, - xuất bớt)"
                value={value as number | undefined}
                onChange={(next) => onChange(next)}
                error={error}
                placeholder="Ví dụ: 50 hoặc -20"
                required
              />
            )}
          />
        </form>

        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-gray-500">Số lượng sau điều chỉnh</p>
          <p className={`text-lg font-semibold ${previewQuantity < 0 ? 'text-red-500' : 'text-green-600'}`}>
            {previewQuantity}
          </p>
        </div>
      </div>
    </ModalCommon>
  )
}

export default AdjustInventoryModal
