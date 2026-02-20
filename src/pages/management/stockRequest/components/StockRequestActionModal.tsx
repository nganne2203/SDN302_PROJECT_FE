import { useEffect, useMemo } from 'react'
import { Button } from 'antd'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ModalCommon from '@/components/common/ModalCommon'
import { ControlledField, TextAreaField } from '@/components/common'

export type StockRequestAction = 'approve' | 'reject'

const buildSchema = (action: StockRequestAction) => {
  return z.object({
    note: action === 'reject'
      ? z.string().min(1, 'Vui long nhap ly do tu choi').max(500, 'Toi da 500 ky tu')
      : z.string().max(500, 'Toi da 500 ky tu').optional()
  })
}

export type StockRequestActionValues = z.infer<ReturnType<typeof buildSchema>>

/* eslint-disable no-unused-vars */
interface StockRequestActionModalProps {
  isOpen: boolean
  actionType: StockRequestAction
  onClose: () => void
  onSubmit: (_values: StockRequestActionValues) => void | Promise<void>
  isSubmitting?: boolean
}

const StockRequestActionModal = ({
  isOpen,
  actionType,
  onClose,
  onSubmit,
  isSubmitting = false
}: StockRequestActionModalProps) => {
  const schema = useMemo(() => buildSchema(actionType), [actionType])
  const { control, handleSubmit, reset } = useForm<StockRequestActionValues>({
    resolver: zodResolver(schema),
    defaultValues: { note: '' }
  })

  useEffect(() => {
    if (isOpen) {
      reset({ note: '' })
    }
  }, [isOpen, reset, actionType])

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title={actionType === 'approve' ? 'Duyet yeu cau nhap kho' : 'Tu choi yeu cau nhap kho'}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={isSubmitting}>
            Huy
          </Button>
          <Button type="primary" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            Xac nhan
          </Button>
        </div>
      }
    >
      <form>
        <ControlledField
          name="note"
          control={control}
          render={({ value, onChange, error }) => (
            <TextAreaField
              label="Ghi chu"
              value={(value as string) || ''}
              onChange={(event) => onChange(event.target.value)}
              error={error}
              rows={3}
              placeholder="Nhap ghi chu"
            />
          )}
        />
      </form>
    </ModalCommon>
  )
}

export default StockRequestActionModal
