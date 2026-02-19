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
    branch: z.string().min(1, 'Vui long chon chi nhanh'),
    product: z.string().min(1, 'Vui long chon san pham'),
    quantity: z.coerce.number().min(0, 'So luong phai >= 0'),
    minThreshold: z.coerce.number().min(0, 'Nguong toi thieu phai >= 0'),
    maxThreshold: z.coerce.number().min(1, 'Nguong toi da phai >= 1')
  })
  .refine((data) => data.maxThreshold > data.minThreshold, {
    message: 'Nguong toi da phai lon hon nguong toi thieu',
    path: ['maxThreshold']
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
      title="Tao ton kho chi nhanh"
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
            Tao moi
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
                label="Chi nhanh"
                value={value as string || undefined}
                onChange={(val) => onChange(val)}
                options={branchOptions}
                error={error}
                placeholder="Chon chi nhanh"
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
            <p className="text-sm text-gray-500">Chi nhanh</p>
            <p className="font-medium">
              {branches.find((b) => b._id === fixedBranchId)?.name || 'Chi nhanh cua ban'}
            </p>
          </div>
        )}

        <ControlledField
          name="product"
          control={control}
          render={({ value, onChange, error }) => (
            <SelectField
              label="San pham"
              value={value as string || undefined}
              onChange={(val) => onChange(val)}
              options={productOptions}
              error={error}
              placeholder="Chon san pham"
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
              label="So luong"
              value={value as number | undefined}
              onChange={(next) => onChange(next)}
              error={error}
              min={0}
              placeholder="Nhap so luong"
              required
            />
          )}
        />

        <ControlledField
          name="minThreshold"
          control={control}
          render={({ value, onChange, error }) => (
            <NumberField
              label="Nguong toi thieu"
              value={value as number | undefined}
              onChange={(next) => onChange(next)}
              error={error}
              min={0}
              placeholder="Nhap nguong toi thieu"
              required
            />
          )}
        />

        <ControlledField
          name="maxThreshold"
          control={control}
          render={({ value, onChange, error }) => (
            <NumberField
              label="Nguong toi da"
              value={value as number | undefined}
              onChange={(next) => onChange(next)}
              error={error}
              min={1}
              placeholder="Nhap nguong toi da"
              required
            />
          )}
        />
      </form>
    </ModalCommon>
  )
}

export default CreateStoreInventoryModal
