import { Eye, XCircle, CheckCircle } from 'lucide-react'
import { TableCommon, ButtonCommon } from '@/components/common'
import { Tooltip } from 'antd'
import OrderStatusBadge from './OrderStatusBadge'
import type { Order, PaginationMeta } from '@/types/api'
import type { TableColumn } from '@/components/common/TableCommon'
import { formatCurrency } from '@/utils/formatCurrency'
import { getOrderPaymentDisplay } from '@/utils/orderPayment'
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
  const getOrderId = (order: Order) => {
    const withMongoId = order as unknown as { _id?: string }
    return withMongoId._id || order.id || ''
  }

  const getOrderStatus = (order: Order) => {
    const withOrderStatus = order as unknown as { orderStatus?: string; status?: string }
    return withOrderStatus.orderStatus || withOrderStatus.status || ''
  }

  const getShippingName = (order: Order) => {
    const shipping = order.shippingAddress as unknown as { fullname?: string; fullName?: string }
    return shipping?.fullname || shipping?.fullName || 'N/A'
  }

  const getShippingPhone = (order: Order) => {
    const shipping = order.shippingAddress as unknown as { phone?: string; phoneNumber?: string }
    return shipping?.phone || shipping?.phoneNumber || 'N/A'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const normalizeStatus = (status?: string) => (typeof status === 'string' ? status.toLowerCase() : '')

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string | null> = {
      pending: 'confirmed',
      confirmed: 'shipped',
      shipped: 'delivered',
      delivered: null,
      cancelled: null
    }
    return statusFlow[normalizeStatus(currentStatus)]
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
          {('orderNumber' in order ? (order as { orderNumber: string }).orderNumber : getOrderId(order).slice(0, 8))}
        </span>
      )
    },
    {
      key: 'customer',
      title: 'Khách hàng',
      width: 200,
      render: (_, order) => (
        <div>
          <div className="text-sm text-gray-900">{getShippingName(order)}</div>
          <div className="text-xs text-gray-500">{getShippingPhone(order)}</div>
        </div>
      )
    },
    {
      key: 'items',
      title: 'Số lượng',
      width: 120,
      render: (_, order) => (
        <span className="text-sm text-gray-900">{order.items?.length || 0} sản phẩm</span>
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
      render: (_, order) => {
        const paymentDisplay = getOrderPaymentDisplay(order, (order as unknown as { paymentStatus?: string }).paymentStatus)
        return (
          <div>
            <div className="text-sm text-gray-900">{order.paymentMethod}</div>
            <div className="text-xs">
              <span className={
                paymentDisplay.tone === 'success' ? 'text-green-600' :
                  paymentDisplay.tone === 'warning' ? 'text-yellow-600' :
                    paymentDisplay.tone === 'error' ? 'text-red-600' : 'text-gray-600'
              }>{paymentDisplay.label}</span>
            </div>
          </div>
        )
      }
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: 150,
      render: (_, order) => <OrderStatusBadge status={getOrderStatus(order)} />
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
        const orderStatus = getOrderStatus(order)
        const nextStatus = getNextStatus(orderStatus)
        const currentStatus = normalizeStatus(orderStatus)
        const canUpdate =
          canManage &&
          nextStatus &&
          onUpdateStatus &&
          currentStatus !== 'cancelled' &&
          currentStatus !== 'delivered'
        const canCancel =
          canManage &&
          onCancelOrder &&
          currentStatus === 'pending'

        return (
          <div className="flex items-center justify-center gap-2">
            <Tooltip title="Xem chi tiết">
              <ButtonCommon
                variant="ghost"
                size="sm"
                onClick={() => onViewDetail(order)}
                icon={<Eye className="w-4 h-4" />}
              />
            </Tooltip>

            {canUpdate && (
              <Tooltip title={getStatusActionLabel(nextStatus)}>
                <ButtonCommon
                  variant="primary"
                  size="sm"
                  onClick={() => onUpdateStatus(getOrderId(order), nextStatus)}
                  icon={<CheckCircle className="w-4 h-4" />}
                />
              </Tooltip>
            )}

            {canCancel && (
              <Tooltip title="Hủy đơn">
                <ButtonCommon
                  variant="danger"
                  size="sm"
                  onClick={() => onCancelOrder(getOrderId(order))}
                  icon={<XCircle className="w-4 h-4" />}
                />
              </Tooltip>
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
      rowKey={(record) => {
        const typedRecord = record as unknown as Order
        return getOrderId(typedRecord)
      }}
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
