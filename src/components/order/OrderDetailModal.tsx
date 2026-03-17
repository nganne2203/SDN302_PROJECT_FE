import { CreditCard, MapPin, Package } from 'lucide-react'
import { ButtonCommon, ModalCommon } from '@/components/common'
import OrderStatusBadge from './OrderStatusBadge'
import type { Order } from '@/types/api'
import { formatCurrency } from '@/utils/formatCurrency'
import { getProductImageUrl } from '@/utils/imageHelper'
import { getOrderPaymentDisplay } from '@/utils/orderPayment'

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus?: (orderId: string, status: string) => void
  onCancelOrder?: (orderId: string) => void
  onEditShippingFee?: (order: Order) => void
  canManage?: boolean
  canEditShippingFee?: boolean
}

const normalizeStatus = (status?: string) => (typeof status === 'string' ? status.toLowerCase() : '')

const getOrderId = (targetOrder: Order) => targetOrder._id || targetOrder.id || ''

const getOrderStatus = (targetOrder: Order) => {
  const withOrderStatus = targetOrder as Order & { orderStatus?: string }
  return withOrderStatus.orderStatus || withOrderStatus.status || ''
}

const getShippingName = (targetOrder: Order) => {
  const shipping = targetOrder.shippingAddress as unknown as { fullname?: string; fullName?: string } | null
  return shipping?.fullname || shipping?.fullName || 'Khách nhận tại quầy'
}

const getShippingPhone = (targetOrder: Order) => {
  const shipping = targetOrder.shippingAddress as unknown as { phone?: string; phoneNumber?: string } | null
  return shipping?.phone || shipping?.phoneNumber || 'Không có'
}

const getShippingAddressText = (targetOrder: Order) => {
  const shipping = targetOrder.shippingAddress as unknown as {
    addressLine?: string
    address?: string
    ward?: string
    city?: string
    province?: string
  } | null

  if (!shipping) return 'Nhận tại quầy'

  const parts = [
    shipping.addressLine || shipping.address,
    shipping.ward,
    shipping.city || shipping.province
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(', ') : 'Nhận tại quầy'
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'Không có'

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
    cancelled: null
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

const extractItemServices = (services: unknown[]): Array<{ name: string; price: number }> => {
  if (!Array.isArray(services)) return []

  return services
    .map((service) => {
      const item = service as {
        name?: string
        serviceName?: string
        price?: number
        servicePrice?: number
        service?: {
          name?: string
          price?: number
        }
      }

      const name = item.name || item.serviceName || item.service?.name
      const rawPrice = item.price ?? item.servicePrice ?? item.service?.price
      const price = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice)

      if (!name || Number.isNaN(price)) return null

      return { name, price }
    })
    .filter((item): item is { name: string; price: number } => item !== null)
}

const OrderDetailModal = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onCancelOrder,
  // onEditShippingFee,
  canManage = false
  // canEditShippingFee = false
}: OrderDetailModalProps) => {
  if (!order) return null

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

  const subtotal = Number(order.subtotal || 0)
  const shippingFee = Number(order.shippingFee || 0)

  return (
    <ModalCommon isOpen={isOpen} onClose={onClose} size="lg">
      <div className="max-h-[85vh] overflow-y-auto p-4 md:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800 md:text-2xl">Chi tiết đơn hàng</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Mã: {order.orderNumber || getOrderId(order)}
            </p>
          </div>
          <OrderStatusBadge status={orderStatus} />
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm text-gray-500">Ngày tạo</p>
            <p className="mt-1 font-medium text-gray-900">{formatDate(order.createdAt)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm text-gray-500">Tổng thanh toán</p>
            <p className="mt-1 font-semibold text-blue-600">{formatCurrency(order.totalAmount)}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-[18px] w-[18px] text-gray-500" />
            <h3 className="text-base font-semibold text-gray-800 md:text-lg">Địa chỉ giao hàng</h3>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="font-medium text-gray-900">{getShippingName(order)}</p>
            <p className="mt-1 text-sm text-gray-600">{getShippingPhone(order)}</p>
            <p className="mt-1 text-sm text-gray-600">{getShippingAddressText(order)}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <CreditCard className="h-[18px] w-[18px] text-gray-500" />
            <h3 className="text-base font-semibold text-gray-800 md:text-lg">Thanh toán</h3>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Phương thức</p>
                <p className="font-medium text-gray-900">
                  {String(order.paymentMethod).toUpperCase() === 'COD'
                    ? 'Thanh toán khi nhận hàng'
                    : 'Thanh toán trực tuyến'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Trạng thái</p>
                {(() => {
                  const paymentDisplay = getOrderPaymentDisplay(order, order.paymentStatus)
                  return (
                    <p className={`font-medium ${
                      paymentDisplay.tone === 'success'
                        ? 'text-green-600'
                        : paymentDisplay.tone === 'warning'
                          ? 'text-yellow-600'
                          : paymentDisplay.tone === 'error'
                            ? 'text-red-600'
                            : 'text-gray-600'
                    }`}
                    >
                      {paymentDisplay.label}
                    </p>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <Package className="h-[18px] w-[18px] text-gray-500" />
            <h3 className="text-base font-semibold text-gray-800 md:text-lg">Sản phẩm</h3>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase text-gray-500">Sản phẩm</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-medium uppercase text-gray-500">Số lượng</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase text-gray-500">Đơn giá</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase text-gray-500">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
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
                    services?: unknown[]
                  }

                  const itemKey = itemRecord._id || itemRecord.id || itemRecord.productId || itemRecord.product?._id || `order-item-${index}`
                  const itemName = itemRecord.productName || itemRecord.product?.name || 'Sản phẩm'
                  const itemImage = itemRecord.productImage || getProductImageUrl(itemRecord.product?.images as never) || '/placeholder.png'
                  const itemQuantity = itemRecord.quantity || 0
                  const itemPrice = itemRecord.price || 0
                  const itemServices = extractItemServices(itemRecord.services || [])

                  return (
                    <tr key={itemKey}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <img src={itemImage} alt={itemName} className="h-11 w-11 rounded object-cover" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{itemName}</p>
                            {itemServices.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {itemServices.map((service, serviceIndex) => (
                                  <p
                                    key={`${itemKey}-service-${serviceIndex}`}
                                    className="text-xs text-gray-500"
                                  >
                                    Dịch vụ: {service.name} ({formatCurrency(service.price)})
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center text-sm text-gray-900">{itemQuantity}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-gray-900">{formatCurrency(itemPrice)}</td>
                      <td className="px-3 py-2.5 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(itemPrice * itemQuantity)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-600">Tạm tính hàng hóa</span>
            <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-600">Phí ship</span>
            <span className="font-medium text-gray-900">{formatCurrency(shippingFee)}</span>
          </div>
          <div className="mt-2 border-t border-gray-200 pt-2.5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Tổng cộng</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
          {/* {canEditShippingFee && onEditShippingFee && (
            <div className="mt-3 flex justify-end">
              <ButtonCommon variant="outline" size="sm" onClick={() => onEditShippingFee(order)}>
                Cập nhật phí ship
              </ButtonCommon>
            </div>
          )} */}
        </div>

        <div className="flex justify-end gap-2">
          <ButtonCommon variant="outline" size="sm" onClick={onClose}>
            Đóng
          </ButtonCommon>

          {canCancel && (
            <ButtonCommon
              variant="danger"
              size="sm"
              onClick={() => {
                onCancelOrder?.(getOrderId(order))
                onClose()
              }}
            >
              Hủy đơn hàng
            </ButtonCommon>
          )}

          {canUpdate && nextStatus && (
            <ButtonCommon
              variant="primary"
              size="sm"
              onClick={() => {
                onUpdateStatus?.(getOrderId(order), nextStatus)
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
