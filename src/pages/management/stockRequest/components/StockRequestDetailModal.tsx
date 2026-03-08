import { Descriptions, Tag, Spin } from 'antd'
import dayjs from 'dayjs'
import { ModalCommon } from '@/components/common'
import type { StockRequestRecord, StockRequestStatus } from '@/types/api'

interface StockRequestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  request: StockRequestRecord | null
  loading: boolean
  isAdmin: boolean
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
  isAdmin
}: StockRequestDetailModalProps) => {
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
      )}
    </ModalCommon>
  )
}

export default StockRequestDetailModal
