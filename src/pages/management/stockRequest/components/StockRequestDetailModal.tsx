import { useState } from 'react'
import { Descriptions, Tag, Spin, Button, Input } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { ModalCommon } from '@/components/common'
import type { StockRequestRecord, StockRequestStatus } from '@/types/api'

interface StockRequestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  request: StockRequestRecord | null
  loading: boolean
  isAdmin: boolean
  onApprove?: (_note?: string) => void | Promise<void>
  onReject?: (_note: string) => void | Promise<void>
  isActioning?: boolean
}

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'warning', label: 'Chờ duyệt' },
  approved: { color: 'success', label: 'Đã duyệt' },
  rejected: { color: 'error', label: 'Bị từ chối' }
}

const StockRequestDetailModal = ({
  isOpen,
  onClose,
  request,
  loading,
  isAdmin,
  onApprove,
  onReject,
  isActioning = false
}: StockRequestDetailModalProps) => {
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState('')

  const handleApprove = async () => {
    setNoteError('')
    await onApprove?.(note.trim() || undefined)
    setNote('')
  }

  const handleReject = async () => {
    if (!note.trim()) {
      setNoteError('Vui lòng nhập lý do từ chối')
      return
    }
    setNoteError('')
    await onReject?.(note.trim())
    setNote('')
  }
  const getStatusTag = (status: StockRequestStatus) => {
    const config = statusConfig[status] || { color: 'default', label: status }
    return <Tag color={config.color}>{config.label}</Tag>
  }

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết yêu cầu nhập kho"
      size="md"
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
          <Descriptions
            bordered
            column={1}
            size="small"
            labelStyle={{ fontWeight: 600, width: 160 }}
          >
            <Descriptions.Item label="Mã yêu cầu">
              {request._id.slice(-6).toUpperCase()}
            </Descriptions.Item>

            {isAdmin && (
              <Descriptions.Item label="Chi nhánh">
                {request.branch?.name || '-'}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Sản phẩm">
              {request.product?.name || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="Số lượng">
              {request.quantity} cái
            </Descriptions.Item>

            <Descriptions.Item label="Người yêu cầu">
              {request.requester?.fullname || '-'}
            </Descriptions.Item>

            {request.reason && (
              <Descriptions.Item label="Lý do">
                {request.reason}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Trạng thái">
              {getStatusTag(request.status)}
            </Descriptions.Item>

            {request.admin && (
              <Descriptions.Item label="Xử lý bởi">
                {request.admin.fullname || '-'}
              </Descriptions.Item>
            )}

            {request.note && (
              <Descriptions.Item label="Ghi chú admin">
                {request.note}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Ngày tạo">
              {dayjs(request.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>

            <Descriptions.Item label="Cập nhật lần cuối">
              {dayjs(request.updatedAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>

          {isAdmin && request.status === 'pending' && onApprove && onReject && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3 mt-3">
              <p className="text-sm font-semibold text-gray-700">Ghi chú / Lý do</p>
              <div>
                <Input.TextArea
                  rows={3}
                  placeholder="Ghi chú hoặc lý do từ chối (bắt buộc khi từ chối)"
                  value={note}
                  onChange={(e) => { setNote(e.target.value); setNoteError('') }}
                  maxLength={500}
                  disabled={isActioning}
                />
                {noteError && <p className="text-red-500 text-xs mt-1">{noteError}</p>}
              </div>
              <div className="flex gap-2 justify-end">
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
