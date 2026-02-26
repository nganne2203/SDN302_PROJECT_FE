/* eslint-disable no-unused-vars */
import { useEffect } from 'react'
import { Button } from 'antd'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ModalCommon from '@/components/common/ModalCommon'
import { ControlledField, NumberField } from '@/components/common'

const thresholdSchema = z
  .object({
    minThreshold: z.coerce.number().min(0, 'Tối thiểu phải >= 0').optional(),
    maxThreshold: z.coerce.number().min(1, 'Tối đa phải >= 1').optional()
  })
  .refine((data) => data.minThreshold !== undefined || data.maxThreshold !== undefined, {
    message: 'Vui lòng nhập ít nhất một ngưỡng'
  })

export type ThresholdFormValues = z.infer<typeof thresholdSchema>

type ThresholdSubmitHandler = (values: ThresholdFormValues) => void | Promise<void>

interface ThresholdModalProps {
  isOpen: boolean
  onClose: () => void
  defaultValues: ThresholdFormValues
  onSubmit: ThresholdSubmitHandler
  isSubmitting?: boolean
}

const ThresholdModal = ({
  isOpen,
  onClose,
  defaultValues,
  onSubmit,
  isSubmitting = false
}: ThresholdModalProps) => {
  const { control, handleSubmit, reset, formState } = useForm<ThresholdFormValues>({
    resolver: zodResolver(thresholdSchema) as Resolver<ThresholdFormValues>,
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
      title="Cập nhật ngưỡng tồn kho"
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
              error={error || formState.errors.root?.message}
              min={1}
              placeholder="Nhập ngưỡng tối đa"
            />
          )}
        />
      </form>
    </ModalCommon>
  )
}

export default ThresholdModal
