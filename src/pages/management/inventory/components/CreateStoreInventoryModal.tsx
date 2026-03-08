/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react'
import { Button } from 'antd'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ModalCommon from '@/components/common/ModalCommon'
import { ControlledField, NumberField, SelectField } from '@/components/common'
import { productApi } from '@/apis/product'
import type { Product, Branch } from '@/types/api'

const createStoreInventorySchema = z
  .object({
    branch: z.string().min(1, 'Vui lòng chọn chi nhánh'),
    product: z.string().min(1, 'Vui lòng chọn sản phẩm'),
    quantity: z.coerce.number().min(0, 'Số lượng phải >= 0'),
    minThreshold: z.coerce.number().min(0, 'Ngưỡng tối thiểu phải >= 0'),
    maxThreshold: z.coerce.number().min(1, 'Ngưỡng tối đa phải >= 1')
  })
  .refine((data) => data.maxThreshold > data.minThreshold, {
    message: 'Ngưỡng tối đa phải lớn hơn ngưỡng tối thiểu',
    path: ['maxThreshold']
  })
  .refine((data) => data.quantity >= data.minThreshold, {
    message: 'Số lượng không được nhỏ hơn ngưỡng tối thiểu',
    path: ['quantity']
  })
  .refine((data) => data.quantity <= data.maxThreshold, {
    message: 'Số lượng không được lớn hơn ngưỡng tối đa',
    path: ['quantity']
  })

export type CreateStoreInventoryFormValues = z.infer<typeof createStoreInventorySchema>

interface CreateStoreInventoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: CreateStoreInventoryFormValues) => void | Promise<void>
  isSubmitting?: boolean
  isAdmin: boolean
  branches: Branch[]
  fixedBranchId: string | null
}

const CreateStoreInventoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  isAdmin,
  branches,
  fixedBranchId
}: CreateStoreInventoryModalProps) => {
  const [products, setProducts] = useState<Product[]>([])

  const defaultBranch = isAdmin ? '' : (fixedBranchId || '')

  const { control, handleSubmit, reset } = useForm<CreateStoreInventoryFormValues>({
    resolver: zodResolver(createStoreInventorySchema) as Resolver<CreateStoreInventoryFormValues>,
    defaultValues: {
      branch: defaultBranch,
      product: '',
      quantity: 0,
      minThreshold: 10,
      maxThreshold: 100
    }
  })

  useEffect(() => {
    if (!isOpen) return
    reset({
      branch: defaultBranch,
      product: '',
      quantity: 0,
      minThreshold: 10,
      maxThreshold: 100
    })
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
  }, [isOpen, reset, defaultBranch])

  const productOptions = products.map((p) => ({
    value: p._id,
    label: p.name
  }))

  const branchOptions = branches.map((b) => ({
    value: b._id,
    label: b.name
  }))

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo tồn kho chi nhánh"
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
        {isAdmin ? (
          <ControlledField
            name="branch"
            control={control}
            render={({ value, onChange, error }) => (
              <SelectField
                label="Chi nhánh"
                value={value as string || undefined}
                onChange={(val) => onChange(val)}
                options={branchOptions}
                error={error}
                placeholder="Chọn chi nhánh"
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
                required
              />
            )}
          />
        ) : (
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm text-gray-500">Chi nhánh</p>
            <p className="font-medium">
              {branches.find((b) => b._id === fixedBranchId)?.name || 'Chi nhánh của bạn'}
            </p>
          </div>
        )}

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
          name="minThreshold"
          control={control}
          render={({ value, onChange, error }) => (
            <NumberField
              label="Ngưỡng tối thiểu"
              value={value as number | undefined}
              onChange={(next) => onChange(next)}
              error={error}
              min={0}
              placeholder="Nhập ngưỡng tối thiểu"
              required
            />
          )}
        />

        <ControlledField
          name="maxThreshold"
          control={control}
          render={({ value, onChange, error }) => (
            <NumberField
              label="Ngưỡng tối đa"
              value={value as number | undefined}
              onChange={(next) => onChange(next)}
              error={error}
              min={1}
              placeholder="Nhập ngưỡng tối đa"
              required
            />
          )}
        />
      </form>
    </ModalCommon>
  )
}

export default CreateStoreInventoryModal
