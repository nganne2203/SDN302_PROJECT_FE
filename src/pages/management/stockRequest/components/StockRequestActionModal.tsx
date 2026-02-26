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
      ? z.string().min(1, 'Vui lòng nhập lý do từ chối').max(500, 'Tối đa 500 ký tự')
      : z.string().max(500, 'Tối đa 500 ký tự').optional()
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
      title={actionType === 'approve' ? 'Duyệt yêu cầu nhập kho' : 'Từ chối yêu cầu nhập kho'}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="primary" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            Xác nhận
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
              label="Ghi chú"
              value={(value as string) || ''}
              onChange={(event) => onChange(event.target.value)}
              error={error}
              rows={3}
              placeholder="Nhập ghi chú"
            />
          )}
        />
      </form>
    </ModalCommon>
  )
}

export default StockRequestActionModal
