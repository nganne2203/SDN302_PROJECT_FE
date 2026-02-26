/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react'
import { Button } from 'antd'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ModalCommon from '@/components/common/ModalCommon'
import { ControlledField, NumberField, InputField, SelectField } from '@/components/common'
import { productApi } from '@/apis/product'
import type { Product } from '@/types/api'

const createInventorySchema = z.object({
  product: z.string().min(1, 'Vui lòng chọn sản phẩm'),
  quantity: z.coerce.number().min(0, 'Số lượng phải >= 0'),
  location: z.string().max(200, 'Vị trí tối đa 200 ký tự').optional()
})

export type CreateInventoryFormValues = z.infer<typeof createInventorySchema>

interface CreateInventoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: CreateInventoryFormValues) => void | Promise<void>
  isSubmitting?: boolean
}

const CreateInventoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false
}: CreateInventoryModalProps) => {
  const [products, setProducts] = useState<Product[]>([])

  const { control, handleSubmit, reset } = useForm<CreateInventoryFormValues>({
    resolver: zodResolver(createInventorySchema) as Resolver<CreateInventoryFormValues>,
    defaultValues: {
      product: '',
      quantity: 0,
      location: ''
    }
  })

  useEffect(() => {
    if (!isOpen) return
    reset({ product: '', quantity: 0, location: '' })
    let cancelled = false
    const fetchProducts = async () => {
      try {
        const res = await productApi.getAllProducts({ isActive: true })
        if (!cancelled) setProducts(res.data)
      } catch {
        if (!cancelled) setProducts([])
      }
    }
    fetchProducts()
    return () => { cancelled = true }
  }, [isOpen, reset])

  const productOptions = products.map((p) => ({
    value: p._id,
    label: p.name
  }))

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo tồn kho mới"
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
            Tạo mới
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
              value={value as string || undefined}
              onChange={(val) => onChange(val)}
              options={productOptions}
              error={error}
              placeholder="Chọn sản phẩm"
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              required
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
              min={0}
              placeholder="Nhập số lượng"
              required
            />
          )}
        />
        <ControlledField
          name="location"
          control={control}
          render={({ value, onChange, error }) => (
            <InputField
              label="Vị trí lưu kho"
              value={(value as string | undefined) || ''}
              onChange={(event) => onChange(event.target.value)}
              error={error}
              placeholder="Ví dụ: Kho A - Tầng 1"
            />
          )}
        />
      </form>
    </ModalCommon>
  )
}

export default CreateInventoryModal
