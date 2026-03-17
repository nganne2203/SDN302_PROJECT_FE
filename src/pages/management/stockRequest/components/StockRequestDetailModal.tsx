import { useState } from 'react'
import { Spin, Button, Input, InputNumber, Tooltip, message } from 'antd'
import { CheckOutlined, CloseOutlined, CopyOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { ModalCommon } from '@/components/common'
import type { StockRequestRecord, StockRequestStatus } from '@/types/api'

/* eslint-disable no-unused-vars */
interface StockRequestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  request: StockRequestRecord | null
  loading: boolean
  isAdmin: boolean
  availableQuantity?: number
  onApprove?: (_payload: { approvedQuantity: number; note?: string }) => void | Promise<void>
  onReject?: (_note: string) => void | Promise<void>
  isActioning?: boolean
}

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-amber-100 text-amber-700', label: 'Chờ duyệt' },
  approved: { color: 'bg-emerald-100 text-emerald-700', label: 'Đã duyệt' },
  partially_approved: { color: 'bg-sky-100 text-sky-700', label: 'Duyệt một phần' },
  rejected: { color: 'bg-rose-100 text-rose-700', label: 'Bị từ chối' }
}

const Field = ({
  label,
  value,
  span2
}: {
  label: string
  value: React.ReactNode
  span2?: boolean
}) => (
  <div className={span2 ? 'col-span-2' : 'col-span-1'}>
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
    <div className="text-sm font-medium text-gray-800 leading-snug">{value}</div>
  </div>
)

const StockRequestDetailModal = ({
  isOpen,
  onClose,
  request,
  loading,
  isAdmin,
  availableQuantity = 0,
  onApprove,
  onReject,
  isActioning = false
}: StockRequestDetailModalProps) => {
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState('')
  const [approvedQuantity, setApprovedQuantity] = useState<number | null>(null)

  const maxApprovable = Math.max(0, availableQuantity)
  const initialApprovedQuantity = request?.quantity || 0
  const currentApprovedQuantity = approvedQuantity ?? initialApprovedQuantity
  const canApprove = currentApprovedQuantity > 0 && currentApprovedQuantity <= maxApprovable

  const handleApprove = async () => {
    setNoteError('')
    if (!request) return
    if (!currentApprovedQuantity || currentApprovedQuantity <= 0) {
      setNoteError('Số lượng duyệt phải lớn hơn 0')
      return
    }
    if (currentApprovedQuantity > availableQuantity) {
      setNoteError('Số lượng duyệt không được vượt quá tồn kho khả dụng')
      return
    }
    await onApprove?.({
      approvedQuantity: currentApprovedQuantity,
      ...(note.trim() ? { note: note.trim() } : {})
    })
    setNote('')
    setApprovedQuantity(null)
  }

  const handleReject = async () => {
    if (!note.trim()) {
      setNoteError('Vui lòng nhập lý do từ chối')
      return
    }
    setNoteError('')
    await onReject?.(note.trim())
    setNote('')
    setApprovedQuantity(null)
  }

  const getStatusBadge = (status: StockRequestStatus) => {
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-600', label: status }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const copyRequestCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => message.success('Đã sao chép mã yêu cầu'))
  }

  const canTakeAction = isAdmin && request?.status === 'pending' && !!onApprove && !!onReject

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết yêu cầu nhập kho"
      size="lg"
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Đang tải..." />
        </div>
      ) : !request ? (
        <div className="text-center py-12 text-gray-500">
          Không tìm thấy thông tin yêu cầu
        </div>
      ) : (
        <div className="space-y-4">
          {/* ── Info card ── */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">

              {/* Row 1: Request Code | Branch */}
              <Field
                label="Mã yêu cầu"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-gray-900">
                      {request._id.slice(-6).toUpperCase()}
                    </span>
                    <Tooltip title="Sao chép">
                      <CopyOutlined
                        className="text-gray-400 hover:text-blue-500 cursor-pointer text-xs"
                        onClick={() => copyRequestCode(request._id.slice(-6).toUpperCase())}
                      />
                    </Tooltip>
                  </span>
                }
              />
              <Field label="Chi nhánh" value={request.branch?.name || '-'} />

              {/* Row 2: Product (full width) */}
              <Field label="Sản phẩm" value={request.product?.name || '-'} span2 />

              {/* Row 3: Quantity | Status */}
              <Field label="Số lượng yêu cầu" value={<span>{request.quantity} <span className="text-gray-400 font-normal">cái</span></span>} />
              <Field label="Trạng thái" value={getStatusBadge(request.status)} />

              {/* Row 4: Requested By (full width) */}
              <Field label="Người yêu cầu" value={request.requester?.fullname || '-'} span2 />

              {/* Row 5: Reason (full width, only if exists) */}
              {request.reason && (
                <Field label="Lý do" value={request.reason} span2 />
              )}

              {/* Row 6: Created At | Updated At */}
              <Field label="Ngày tạo" value={dayjs(request.createdAt).format('DD/MM/YYYY HH:mm')} />
              <Field label="Cập nhật lần cuối" value={dayjs(request.updatedAt).format('DD/MM/YYYY HH:mm')} />

              {/* Row 7: Processed By | Admin Note */}
              <Field label="Xử lý bởi" value={request.admin?.fullname || <span className="text-gray-400">—</span>} />
              <Field
                label="Ghi chú admin"
                value={request.note || <span className="text-gray-400">Không có</span>}
              />

            </div>
          </div>

          {/* ── Approval action panel ── */}
          {canTakeAction && (
            <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">Xử lý yêu cầu</p>

              {/* Quantity + Note row */}
              <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                {/* Quantity */}
                <div className="flex flex-col">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Số lượng duyệt</label>
                  <Tooltip title={`Tối đa: ${maxApprovable} cái (theo tồn kho)`}>
                    <InputNumber
                      min={1}
                      max={maxApprovable}
                      value={approvedQuantity ?? initialApprovedQuantity}
                      onChange={(value) => {
                        setApprovedQuantity(typeof value === 'number' ? value : null)
                        setNoteError('')
                      }}
                      className="w-full"
                      disabled={isActioning || maxApprovable <= 0}
                      status={approvedQuantity !== null && !canApprove ? 'error' : undefined}
                    />
                  </Tooltip>
                  <p className="text-[11px] text-gray-400 mt-1">Tối đa: {maxApprovable} cái</p>
                </div>

                {/* Note textarea */}
                <div className="flex flex-col">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Ghi chú <span className="text-gray-400 font-normal">(bắt buộc khi từ chối)</span>
                  </label>
                  <Input.TextArea
                    rows={3}
                    placeholder="Nhập ghi chú hoặc lý do từ chối…"
                    value={note}
                    onChange={(e) => { setNote(e.target.value); setNoteError('') }}
                    maxLength={500}
                    disabled={isActioning}
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>

              {noteError && <p className="text-red-500 text-xs">{noteError}</p>}

              {/* Action buttons */}
              <div className="flex gap-2 justify-end pt-1">
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={handleReject}
                  loading={isActioning}
                >
                  Từ chối
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleApprove}
                  loading={isActioning}
                  disabled={!canApprove}
                >
                  Duyệt
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </ModalCommon>
  )
}

export default StockRequestDetailModal
