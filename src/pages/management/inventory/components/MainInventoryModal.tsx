/* eslint-disable no-unused-vars */
import { useEffect } from 'react'
import { Button } from 'antd'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ModalCommon from '@/components/common/ModalCommon'
import { ControlledField, NumberField, InputField } from '@/components/common'

const mainInventorySchema = z.object({
  quantity: z.coerce.number().min(0, 'So luong phai >= 0').optional(),
  location: z.string().max(200, 'Vi tri toi da 200 ky tu').optional()
})

export type MainInventoryFormValues = z.infer<typeof mainInventorySchema>

interface MainInventoryModalProps {
  isOpen: boolean
  onClose: () => void
  defaultValues: MainInventoryFormValues
  onSubmit: (values: MainInventoryFormValues) => void | Promise<void>
  isSubmitting?: boolean
}

const MainInventoryModal = ({
  isOpen,
  onClose,
  defaultValues,
  onSubmit,
  isSubmitting = false
}: MainInventoryModalProps) => {
  const { control, handleSubmit, reset } = useForm<MainInventoryFormValues>({
    resolver: zodResolver(mainInventorySchema) as Resolver<MainInventoryFormValues>,
    defaultValues
  })

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues)
    }
  }, [defaultValues, isOpen, reset])

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title="Dieu chinh ton kho kho tong"
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
            Luu
          </Button>
        </div>
      }
    >
      <form className="space-y-2">
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
            />
          )}
        />
        <ControlledField
          name="location"
          control={control}
          render={({ value, onChange, error }) => (
            <InputField
              label="Vi tri luu kho"
              value={(value as string | undefined) || ''}
              onChange={(event) => onChange(event.target.value)}
              error={error}
              placeholder="Vi du: Kho A - Tang 1"
            />
          )}
        />
      </form>
    </ModalCommon>
  )
}

export default MainInventoryModal
