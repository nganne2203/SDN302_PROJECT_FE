import { MapPin, CreditCard, Package } from 'lucide-react'
import { ButtonCommon, ModalCommon } from '@/components/common'
import OrderStatusBadge from './OrderStatusBadge'
import type { Order } from '@/types/api'
import { formatCurrency } from '@/utils/formatCurrency'
import { getProductImageUrl } from '@/utils/imageHelper'

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  // eslint-disable-next-line no-unused-vars
  onUpdateStatus?: (orderId: string, status: string) => void
  // eslint-disable-next-line no-unused-vars
  onCancelOrder?: (orderId: string) => void
  canManage?: boolean
}

const OrderDetailModal = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onCancelOrder,
  canManage = false
}: OrderDetailModalProps) => {
  if (!order) return null

  const getOrderId = (targetOrder: Order) => {
    const withMongoId = targetOrder as unknown as { _id?: string }
    return withMongoId._id || targetOrder.id || ''
  }

  const getOrderStatus = (targetOrder: Order) => {
    const withOrderStatus = targetOrder as unknown as { orderStatus?: string; status?: string }
    return withOrderStatus.orderStatus || withOrderStatus.status || ''
  }

  const getShippingName = (targetOrder: Order) => {
    const shipping = targetOrder.shippingAddress as unknown as { fullname?: string; fullName?: string }
    return shipping?.fullname || shipping?.fullName || 'N/A'
  }

  const getShippingPhone = (targetOrder: Order) => {
    const shipping = targetOrder.shippingAddress as unknown as { phone?: string; phoneNumber?: string }
    return shipping?.phone || shipping?.phoneNumber || 'N/A'
  }

  const getShippingAddressText = (targetOrder: Order) => {
    const shipping = targetOrder.shippingAddress as unknown as {
      addressLine?: string
      address?: string
      ward?: string
      district?: string
      city?: string
      province?: string
    }

    const parts = [
      shipping?.addressLine || shipping?.address,
      shipping?.ward,
      shipping?.district,
      shipping?.city || shipping?.province
    ].filter(Boolean)

    return parts.length > 0 ? parts.join(', ') : 'N/A'
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
      canceled: null
    }
    return statusFlow[normalizeStatus(currentStatus)]
  }

  const getStatusActionLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Xác nhận đơn hàng',
      shipped: 'Chuyển sang giao hàng',
      delivered: 'Hoàn thành đơn hàng'
    }
    return labels[status] || 'Cập nhật'
  }

  const orderStatus = getOrderStatus(order)
  const nextStatus = getNextStatus(orderStatus)
  const currentStatus = normalizeStatus(orderStatus)
  const canUpdate =
    canManage &&
    nextStatus &&
    onUpdateStatus &&
    currentStatus !== 'canceled' &&
    currentStatus !== 'delivered'
  const canCancel =
    canManage &&
    onCancelOrder &&
    currentStatus === 'pending'

  return (
    <ModalCommon isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng</h2>
            <p className="text-gray-500 mt-1">
              Mã: {'orderNumber' in order ? (order as { orderNumber: string }).orderNumber : getOrderId(order)}
            </p>
          </div>
        </div>

        {/* Status and Date */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
            <OrderStatusBadge status={orderStatus} />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Ngày tạo</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">Địa chỉ giao hàng</h3>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">{getShippingName(order)}</p>
            <p className="text-sm text-gray-600 mt-1">{getShippingPhone(order)}</p>
            <p className="text-sm text-gray-600 mt-1">
              {getShippingAddressText(order)}
            </p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">Thanh toán</h3>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Phương thức</p>
                <p className="font-medium text-gray-900">{order.paymentMethod.toUpperCase() === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán trực tuyến'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Trạng thái</p>
                <p className={`font-medium ${
                  String(order.paymentStatus || '').toUpperCase() === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {String(order.paymentStatus || '').toUpperCase() === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">Sản phẩm</h3>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Số lượng
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Đơn giá
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(order.items || []).map((item, index) => {
                  const itemRecord = item as unknown as {
                    _id?: string
                    id?: string
                    productId?: string
                    productName?: string
                    productImage?: string
                    quantity?: number
                    price?: number
                    product?: {
                      _id?: string
                      name?: string
                      images?: unknown
                    }
                  }
                  const itemKey = itemRecord._id || itemRecord.id || itemRecord.productId || itemRecord.product?._id || `order-item-${index}`
                  const itemName = itemRecord.productName || itemRecord.product?.name || 'Sản phẩm'
                  const itemImage = itemRecord.productImage || getProductImageUrl(itemRecord.product?.images as never) || '/placeholder.png'
                  const itemQuantity = itemRecord.quantity || 0
                  const itemPrice = itemRecord.price || 0
                  return (
                    <tr key={itemKey}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={itemImage}
                            alt={itemName}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {itemName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {itemQuantity}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {formatCurrency(itemPrice)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(itemPrice * itemQuantity)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-800">Tổng cộng</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <ButtonCommon variant="outline" size="md" onClick={onClose}>
            Đóng
          </ButtonCommon>

          {canCancel && (
            <ButtonCommon
              variant="danger"
              size="md"
              onClick={() => {
                onCancelOrder(getOrderId(order))
                onClose()
              }}
            >
              Hủy đơn hàng
            </ButtonCommon>
          )}

          {canUpdate && (
            <ButtonCommon
              variant="primary"
              size="md"
              onClick={() => {
                onUpdateStatus(getOrderId(order), nextStatus)
                onClose()
              }}
            >
              {getStatusActionLabel(nextStatus)}
            </ButtonCommon>
          )}
        </div>
      </div>
    </ModalCommon>
  )
}

export default OrderDetailModal
