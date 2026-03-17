import { useEffect, useMemo } from 'react'
import { Button } from 'antd'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ModalCommon from '@/components/common/ModalCommon'
import { ControlledField, NumberField, TextAreaField } from '@/components/common'

export type StockRequestAction = 'approve' | 'reject'

const buildSchema = (action: StockRequestAction, maxApprovable?: number) => {
  return z.object({
    approvedQuantity: action === 'approve'
      ? z.coerce.number()
        .int('Số lượng duyệt phải là số nguyên')
        .positive('Số lượng duyệt phải lớn hơn 0')
        .max(maxApprovable || Number.MAX_SAFE_INTEGER, 'Số lượng duyệt vượt quá số lượng cho phép')
      : z.number().optional(),
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
  requestedQuantity?: number
  availableQuantity?: number
  isSubmitting?: boolean
}

const StockRequestActionModal = ({
  isOpen,
  actionType,
  onClose,
  onSubmit,
  requestedQuantity,
  availableQuantity,
  isSubmitting = false
}: StockRequestActionModalProps) => {
  const maxApprovable = useMemo(() => {
    if (actionType !== 'approve') return undefined
    return Math.max(0, availableQuantity || 0)
  }, [actionType, availableQuantity])

  const initialApprovedQuantity = useMemo(() => {
    if (actionType !== 'approve') return undefined
    return requestedQuantity || 0
  }, [actionType, requestedQuantity])

  const schema = useMemo(() => buildSchema(actionType, maxApprovable), [actionType, maxApprovable])
  const { control, handleSubmit, reset } = useForm<StockRequestActionValues>({
    resolver: zodResolver(schema),
    defaultValues: { approvedQuantity: initialApprovedQuantity, note: '' }
  })

  useEffect(() => {
    if (isOpen) {
      reset({ approvedQuantity: initialApprovedQuantity, note: '' })
    }
  }, [actionType, initialApprovedQuantity, isOpen, reset])

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
        {actionType === 'approve' && (
          <>
            <div className="mb-3 rounded border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
              <div>Số lượng yêu cầu: <strong>{requestedQuantity || 0}</strong></div>
              <div>Tồn kho khả dụng: <strong>{availableQuantity ?? 0}</strong></div>
            </div>
            <ControlledField
              name="approvedQuantity"
              control={control}
              render={({ value, onChange, error }) => (
                <NumberField
                  label="Số lượng duyệt"
                  value={value as number | undefined}
                  onChange={(nextValue) => onChange(Number(nextValue || 0))}
                  error={error}
                  min={1}
                  max={maxApprovable}
                  precision={0}
                  placeholder="Nhập số lượng duyệt"
                  required
                />
              )}
            />
          </>
        )}
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
