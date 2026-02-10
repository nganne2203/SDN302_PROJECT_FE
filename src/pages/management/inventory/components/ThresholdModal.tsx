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
    minThreshold: z.coerce.number().min(0, 'Toi thieu phai >= 0').optional(),
    maxThreshold: z.coerce.number().min(1, 'Toi da phai >= 1').optional()
  })
  .refine((data) => data.minThreshold !== undefined || data.maxThreshold !== undefined, {
    message: 'Vui long nhap it nhat mot nguong'
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
      title="Cap nhat nguong ton kho"
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
              error={error || formState.errors.root?.message}
              min={1}
              placeholder="Nhap nguong toi da"
            />
          )}
        />
      </form>
    </ModalCommon>
  )
}

export default ThresholdModal
