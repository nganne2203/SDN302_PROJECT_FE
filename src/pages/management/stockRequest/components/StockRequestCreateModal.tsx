import { useEffect } from 'react'
import { Button } from 'antd'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ModalCommon from '@/components/common/ModalCommon'
import { ControlledField, SelectField, NumberField, TextAreaField } from '@/components/common'
import type { Product } from '@/types/api'

const createSchema = z.object({
  product: z.string().min(1, 'Vui lòng chọn sản phẩm'),
  quantity: z.coerce.number().min(1, 'Số lượng phải lớn hơn 0'),
  reason: z.string().max(500, 'Tối đa 500 ký tự').optional()
})

export type StockRequestCreateValues = z.infer<typeof createSchema>

/* eslint-disable no-unused-vars */
interface StockRequestCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (_values: StockRequestCreateValues) => void | Promise<void>
  products: Product[]
  isSubmitting?: boolean
}

const StockRequestCreateModal = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  isSubmitting = false
}: StockRequestCreateModalProps) => {
  const { control, handleSubmit, reset } = useForm<StockRequestCreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { quantity: 1 }
  })

  useEffect(() => {
    if (isOpen) {
      reset({ quantity: 1, product: '', reason: '' })
    }
  }, [isOpen, reset])

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo yêu cầu nhập kho mới"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="primary" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            Tạo
          </Button>
        </div>
      }
    >
      <form className="space-y-2">
        <ControlledField
          name="product"
          control={control}
          render={({ value, onChange, error }) => (
            <SelectField
              label="Sản phẩm"
              value={(value as string) || undefined}
              onChange={(next) => onChange(next)}
              error={error}
              placeholder="Chọn sản phẩm"
              options={products.map((product) => ({
                label: product.name,
                value: product._id
              }))}
            />
          )}
        />
        <ControlledField
          name="quantity"
          control={control}
          render={({ value, onChange, error }) => (
            <NumberField
              label="Số lượng"
              value={value as number | undefined}
              onChange={(next) => onChange(next)}
              error={error}
              min={1}
              placeholder="Nhập số lượng"
            />
          )}
        />
        <ControlledField
          name="reason"
          control={control}
          render={({ value, onChange, error }) => (
            <TextAreaField
              label="Lý do yêu cầu (tùy chọn)"
              value={(value as string) || ''}
              onChange={(event) => onChange(event.target.value)}
              error={error}
              placeholder="Mô tả lý do yêu cầu nhập kho"
              rows={3}
            />
          )}
        />
      </form>
    </ModalCommon>
  )
}

export default StockRequestCreateModal
