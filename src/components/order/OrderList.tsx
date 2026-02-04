import { Eye, XCircle, CheckCircle } from 'lucide-react'
import { TableCommon, ButtonCommon } from '@/components/common'
import OrderStatusBadge from './OrderStatusBadge'
import type { Order, PaginationMeta } from '@/types/api'
import type { TableColumn } from '@/components/common/TableCommon'
import { formatCurrency } from '@/utils/formatCurrency'

interface OrderListProps {
  orders: Order[]
  pagination: PaginationMeta | null
  isLoading: boolean
  // eslint-disable-next-line no-unused-vars
  onViewDetail: (order: Order) => void
  // eslint-disable-next-line no-unused-vars
  onUpdateStatus?: (orderId: string, status: string) => void
  // eslint-disable-next-line no-unused-vars
  onCancelOrder?: (orderId: string) => void
  // eslint-disable-next-line no-unused-vars
  onPageChange: (page: number) => void
  canManage?: boolean
}

const OrderList = ({
  orders,
  pagination,
  isLoading,
  onViewDetail,
  onUpdateStatus,
  onCancelOrder,
  onPageChange,
  canManage = false
}: OrderListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string | null> = {
      pending: 'confirmed',
      confirmed: 'shipped',
      shipped: 'delivered',
      delivered: null,
      canceled: null
    }
    return statusFlow[currentStatus.toLowerCase()]
  }

  const getStatusActionLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Xác nhận',
      shipped: 'Giao hàng',
      delivered: 'Hoàn thành'
    }
    return labels[status] || 'Cập nhật'
  }

  // Table columns configuration
  const columns: TableColumn<Order>[] = [
    {
      key: 'orderNumber',
      title: 'Mã đơn',
      width: 150,
      render: (_, order) => (
        <span className="font-medium text-gray-900">
          {('orderNumber' in order ? (order as { orderNumber: string }).orderNumber : order.id.slice(0, 8))}
        </span>
      )
    },
    {
      key: 'customer',
      title: 'Khách hàng',
      width: 200,
      render: (_, order) => (
        <div>
          <div className="text-sm text-gray-900">{order.shippingAddress?.fullName || 'N/A'}</div>
          <div className="text-xs text-gray-500">{order.shippingAddress?.phoneNumber || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'items',
      title: 'Số lượng',
      width: 120,
      render: (_, order) => (
        <span className="text-sm text-gray-900">{order.items.length} sản phẩm</span>
      )
    },
    {
      key: 'totalAmount',
      title: 'Tổng tiền',
      width: 150,
      render: (_, order) => (
        <span className="text-sm font-semibold text-blue-600">
          {formatCurrency(order.totalAmount)}
        </span>
      )
    },
    {
      key: 'payment',
      title: 'Thanh toán',
      width: 150,
      render: (_, order) => (
        <div>
          <div className="text-sm text-gray-900">{order.paymentMethod}</div>
          <div className="text-xs">
            {order.paymentStatus === 'PAID' ? (
              <span className="text-green-600">Đã thanh toán</span>
            ) : (
              <span className="text-yellow-600">Chưa thanh toán</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: 150,
      render: (_, order) => <OrderStatusBadge status={order.status} />
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      width: 150,
      render: (_, order) => (
        <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
      )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: 200,
      align: 'center',
      render: (_, order) => {
        const nextStatus = getNextStatus(order.status)
        const canUpdate =
          canManage &&
          nextStatus &&
          onUpdateStatus &&
          order.status.toLowerCase() !== 'canceled' &&
          order.status.toLowerCase() !== 'delivered'
        const canCancel =
          canManage &&
          onCancelOrder &&
          order.status.toLowerCase() === 'pending'

        return (
          <div className="flex items-center justify-center gap-2">
            <ButtonCommon
              variant="ghost"
              size="sm"
              onClick={() => onViewDetail(order)}
            >
              <Eye className="w-4 h-4" />
            </ButtonCommon>

            {canUpdate && (
              <ButtonCommon
                variant="primary"
                size="sm"
                onClick={() => onUpdateStatus(order.id, nextStatus)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {getStatusActionLabel(nextStatus)}
              </ButtonCommon>
            )}

            {canCancel && (
              <ButtonCommon
                variant="danger"
                size="sm"
                onClick={() => onCancelOrder(order.id)}
              >
                <XCircle className="w-4 h-4" />
              </ButtonCommon>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <TableCommon
      columns={columns as unknown as TableColumn<Record<string, unknown>>[]}
      data={orders as unknown as Record<string, unknown>[]}
      loading={isLoading}
      rowKey="id"
      pagination={{
        current: pagination?.currentPage || 1,
        pageSize: pagination?.pageSize || 10,
        total: pagination?.totalItems || 0,
        showSizeChanger: true,
        showQuickJumper: true,
        onChange: (page) => {
          onPageChange(page)
        }
      }}
      scroll={{ x: 1200 }}
      size="middle"
      emptyText="Không có đơn hàng"
    />
  )
}

export default OrderList
