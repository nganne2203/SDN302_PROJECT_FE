/* eslint-disable no-unused-vars */
import { useEffect } from 'react'
import { Button } from 'antd'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ModalCommon from '@/components/common/ModalCommon'
import { ControlledField, NumberField, InputField } from '@/components/common'

const mainInventorySchema = z.object({
  quantity: z.coerce.number().min(0, 'Số lượng phải >= 0').optional(),
  location: z.string().max(200, 'Vị trí tối đa 200 ký tự').optional()
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
      title="Điều chỉnh tồn kho kho tổng"
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
            Lưu
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
              label="Số lượng"
              value={value as number | undefined}
              onChange={(next) => onChange(next)}
              error={error}
              min={0}
              placeholder="Nhập số lượng"
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

export default MainInventoryModal
