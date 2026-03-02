import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Button,
  Card,
  Col,
  Descriptions,
  Modal,
  Row,
  Skeleton,
  Table,
  Tag,
  Typography,
  message
} from 'antd'
import { ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { orderApi } from '@/apis/order'
import OrderStatusBadge from '@/components/order/OrderStatusBadge'
import { formatCurrency } from '@/utils/formatCurrency'
import { getProductImageUrl } from '@/utils/imageHelper'
import { ROUTES } from '@/constants/constant'

const { Title, Text } = Typography

// ── Exact shape returned by GET /api/v1/orders/:id ──────────────────────────
interface BackendProduct {
  _id: string
  name: string
  slug?: string
  price: number
  images: string[]
}

interface BackendItem {
  _id: string
  product: BackendProduct
  quantity: number
  price: number
  services: unknown[]
}

interface BackendShippingAddress {
  fullname: string
  phone: string
  addressLine: string
  city: string
  district: string
  ward: string
}

interface BackendDelivery {
  status: string
  providerName?: string
  trackingCode?: string
  recipientName?: string
}

interface BackendBranch {
  _id: string
  name: string
  address: string
}

interface BackendOrder {
  _id: string
  orderNumber: string
  type: string
  orderStatus: string
  subtotal: number
  shippingFee: number
  totalAmount: number
  discount?: number
  paymentMethod: string
  paymentStatus?: string
  message?: string
  cancelReason?: string
  shippingAddress: BackendShippingAddress
  delivery: BackendDelivery
  branch?: BackendBranch
  items: BackendItem[]
  createdAt: string
  updatedAt: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const PAYMENT_METHOD_MAP: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  vnpay: 'VNPay',
  bank_transfer: 'Chuyển khoản ngân hàng',
  credit_card: 'Thẻ tín dụng',
  e_wallet: 'Ví điện tử'
}

const DELIVERY_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ giao', color: 'default' },
  picked_up: { label: 'Đã lấy hàng', color: 'processing' },
  in_transit: { label: 'Đang vận chuyển', color: 'blue' },
  delivered: { label: 'Đã giao', color: 'success' },
  failed: { label: 'Giao thất bại', color: 'error' }
}

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<BackendOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  const loadOrder = () => {
    if (!id) return
    setIsLoading(true)
    orderApi
      .getOrderById(id)
      .then((res) => setOrder(res.data as unknown as BackendOrder))
      .catch(() => message.error('Không thể tải thông tin đơn hàng'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const canCancel = ['pending', 'confirmed'].includes((order?.orderStatus ?? '').toLowerCase())

  const handleCancel = () => {
    Modal.confirm({
      title: 'Hủy đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc muốn hủy đơn hàng này không?',
      okText: 'Hủy đơn',
      okType: 'danger',
      cancelText: 'Không',
      onOk: async () => {
        if (!id) return
        setIsCancelling(true)
        try {
          await orderApi.cancelOrder(id)
          message.success('Đã hủy đơn hàng thành công')
          loadOrder()
        } catch {
          message.error('Không thể hủy đơn hàng')
        } finally {
          setIsCancelling(false)
        }
      }
    })
  }

  const itemColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: unknown, item: BackendItem) => {
        const imgUrl = getProductImageUrl(item.product.images as never)
        return (
          <div className="flex items-center gap-3">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={item.product.name}
                className="w-12 h-12 rounded object-cover bg-gray-100 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0" />
            )}
            <span className="font-medium text-gray-800 line-clamp-2">
              {item.product.name}
            </span>
          </div>
        )
      }
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      render: (v: number) => formatCurrency(v)
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'qty',
      align: 'center' as const
    },
    {
      title: 'Thành tiền',
      key: 'lineTotal',
      align: 'right' as const,
      render: (_: unknown, item: BackendItem) => (
        <Text strong className="text-blue-600">
          {formatCurrency(item.price * item.quantity)}
        </Text>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton active paragraph={{ rows: 14 }} />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy đơn hàng</p>
          <Button onClick={() => navigate(ROUTES.ORDERS)}>Quay lại danh sách</Button>
        </div>
      </div>
    )
  }

  const addr = order.shippingAddress
  const delivery = order.delivery
  const shippingFee = order.shippingFee ?? 0
  const payMethodKey = (order.paymentMethod ?? '').toLowerCase()
  const deliveryStatusKey = (delivery?.status ?? '').toLowerCase()
  const deliveryStatusInfo = DELIVERY_STATUS_MAP[deliveryStatusKey] ?? {
    label: delivery?.status ?? '—',
    color: 'default'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={ROUTES.ORDERS}>
              <Button icon={<ArrowLeftOutlined />} type="text">
                Đơn hàng của tôi
              </Button>
            </Link>
            <Title level={4} className="!mb-0">
              Chi tiết đơn hàng
              {order.orderNumber && (
                <span className="ml-2 text-gray-500 font-normal text-sm">
                  #{order.orderNumber}
                </span>
              )}
            </Title>
          </div>
          <OrderStatusBadge status={order.orderStatus} />
        </div>

        {/* ── Items table ── */}
        <Card title="Sản phẩm đặt hàng" variant="borderless" className="shadow-sm">
          <Table
            dataSource={order.items}
            rowKey={(item) => item._id}
            columns={itemColumns}
            pagination={false}
            size="middle"
          />
          <div className="mt-4 space-y-1.5 text-sm flex flex-col items-end">
            <div className="flex justify-between w-64">
              <span className="text-gray-500">Tạm tính</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between w-64">
              <span className="text-gray-500">Phí vận chuyển</span>
              <span className={shippingFee === 0 ? 'text-green-600' : 'text-orange-500'}>
                {shippingFee === 0 ? 'Miễn phí' : `+${formatCurrency(shippingFee)}`}
              </span>
            </div>
            {(order.discount ?? 0) > 0 && (
              <div className="flex justify-between w-64">
                <span className="text-gray-500">Giảm giá</span>
                <span className="text-red-500">-{formatCurrency(order.discount!)}</span>
              </div>
            )}
            <div className="flex justify-between w-64 pt-2 border-t border-gray-200">
              <span className="font-semibold text-base">Tổng cộng</span>
              <span className="font-bold text-lg text-blue-600">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </Card>

        <Row gutter={[16, 16]}>
          {/* ── Shipping address ── */}
          <Col xs={24} md={14}>
            <Card title="Thông tin giao hàng" variant="borderless" className="shadow-sm h-full">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Người nhận">{addr.fullname}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{addr.phone}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  {[addr.addressLine, addr.ward, addr.district, addr.city]
                    .filter(Boolean)
                    .join(', ')}
                </Descriptions.Item>
              </Descriptions>

              {/* Delivery tracking */}
              {delivery && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Vận chuyển:</span>
                    <Tag color={deliveryStatusInfo.color}>{deliveryStatusInfo.label}</Tag>
                  </div>
                  {delivery.trackingCode && (
                    <div className="text-xs text-gray-500">
                      Mã vận đơn:{' '}
                      <span className="font-mono text-gray-700">{delivery.trackingCode}</span>
                    </div>
                  )}
                  {delivery.providerName && (
                    <div className="text-xs text-gray-500">
                      Đơn vị vận chuyển: {delivery.providerName}
                    </div>
                  )}
                </div>
              )}

              {order.message && (
                <div className="mt-3 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Ghi chú: </span>
                  {order.message}
                </div>
              )}
              {order.cancelReason && (
                <div className="mt-3 text-sm text-red-500">
                  <span className="font-medium">Lý do hủy: </span>
                  {order.cancelReason}
                </div>
              )}
            </Card>
          </Col>

          {/* ── Payment & branch ── */}
          <Col xs={24} md={10}>
            <Card title="Thanh toán & Chi nhánh" variant="borderless" className="shadow-sm h-full">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Phương thức">
                  {PAYMENT_METHOD_MAP[payMethodKey] ?? order.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString('vi-VN')
                    : '—'}
                </Descriptions.Item>
                {order.branch && (
                  <Descriptions.Item label="Chi nhánh xuất hàng">
                    <div>
                      <div className="font-medium">{order.branch.name}</div>
                      <div className="text-xs text-gray-400">{order.branch.address}</div>
                    </div>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* ── Cancel action ── */}
        {canCancel && (
          <div className="flex justify-end">
            <Button
              danger
              size="large"
              loading={isCancelling}
              onClick={handleCancel}
            >
              Hủy đơn hàng
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}

export default OrderDetailPage
