import { Table, InputNumber, Button, Empty } from 'antd'
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/utils/formatCurrency'
import { getProductImageUrl } from '@/utils/imageHelper'
import { ROUTES } from '@/constants/constant'
import { LoaderCommon } from '@/components/common'
import useCart from '@/hooks/useCart'

const Cart = () => {
  const {
    cartItems,
    isLoading,
    isPricingLoading,
    totalItems,
    totalAmount,
    getItemPricing,
    updateQuantity,
    removeItem
  } = useCart()

  const getCartLineKey = (record: any) => {
    const extractId = (value: any): string | undefined => {
      if (typeof value === 'string') return value
      if (!value || typeof value !== 'object') return undefined
      if (typeof value._id === 'string') return value._id
      if (typeof value.id === 'string') return value.id
      return undefined
    }

    const lineId = extractId(record?.id) || extractId(record?._id)
    if (lineId) return lineId

    const productId = record?.productId || record?.product?._id || record?.product?.id || 'unknown-product'
    const serviceIds = (record?.services || [])
      .map((svc: any) => (
        extractId(svc?.serviceId)
        || extractId(svc?.service?._id)
        || extractId(svc?.service?.id)
        || extractId(svc?._id)
        || extractId(svc?.id)
        || extractId(svc?.service)
      ))
      .filter(Boolean)
      .sort()
      .join(',') || 'no-services'

    return `${extractId(productId) || productId}::${serviceIds}`
  }

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      render: (_: unknown, record: (typeof cartItems)[0]) => {
        const imageUrl = getProductImageUrl(record.product.images)
        return (
          <div className="flex items-center gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={record.product.name}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  const el = e.currentTarget
                  el.style.display = 'none'
                  const placeholder = el.nextElementSibling as HTMLElement | null
                  if (placeholder) placeholder.style.display = 'flex'
                }}
              />
            ) : null}
            <div
              className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0"
              style={{ display: imageUrl ? 'none' : 'flex' }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{record.product.name}</h4>
              <div className="flex items-center gap-2">
                <p className="text-blue-600 font-semibold">
                  {formatCurrency(record.price)}
                </p>
              </div>
              {record.services && record.services.length > 0 && (
                <div className="mt-2 text-xs text-purple-700">
                  <span>Dịch vụ bổ sung:</span>
                  <ul className="list-disc ml-4">
                    {record.services.map((svc: any) => (
                      <li key={svc.serviceId}>
                        {svc.service?.name} (+{formatCurrency(svc.price)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )
      }
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      render: (_: unknown, record: (typeof cartItems)[0]) => {
        return (
          <InputNumber
            min={1}
            max={99}
            value={record.quantity}
            onChange={(value) => {
              updateQuantity(record, value)
            }}
            className="w-20"
          />
        )
      }
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: 150,
      render: (_: unknown, record: (typeof cartItems)[0]) => {
        // Hiển thị tổng tiền đã cộng dịch vụ
        const itemTotal = record.totalPrice ?? (record.price * record.quantity)
        return (
          <span className="font-semibold text-gray-800">
            {formatCurrency(itemTotal)}
          </span>
        )
      }
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: unknown, record: (typeof cartItems)[0]) => {
        return (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              removeItem(record)
            }}
          />
        )
      }
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <LoaderCommon size="lg" tip="Đang tải giỏ hàng..." />
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Empty
            image={<ShoppingOutlined className="text-6xl text-gray-300" />}
            description={
              <div className="text-center">
                <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống</p>
                <Link to={ROUTES.PRODUCTS}>
                  <Button type="primary" size="large">
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Giỏ hàng của bạn</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <Table
                dataSource={cartItems}
                columns={columns}
                rowKey={getCartLineKey}
                pagination={false}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({totalItems} sản phẩm)</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí dịch vụ bổ sung</span>
                  <span className="text-purple-700">
                    {formatCurrency(cartItems.reduce((sum, item) => {
                      // Nếu backend trả về serviceFee, dùng luôn, nếu không thì tính lại từ services
                      if (typeof item.serviceFee === 'number') {
                        return sum + item.serviceFee * item.quantity
                      }
                      if (item.services && item.services.length > 0) {
                        const fee = item.services.reduce((s, svc) => s + (svc.price || 0), 0)
                        return sum + fee * item.quantity
                      }
                      return sum
                    }, 0))}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-800 mb-6">
                <span>Tổng cộng</span>
                <span className="text-blue-600">{
                  formatCurrency(
                    cartItems.reduce((sum, item) => {
                      // Nếu backend trả về totalPrice, dùng luôn, nếu không thì tính lại
                      if (typeof item.totalPrice === 'number') {
                        return sum + item.totalPrice
                      }
                      const fee = typeof item.serviceFee === 'number'
                        ? item.serviceFee * item.quantity
                        : item.services && item.services.length > 0
                          ? item.services.reduce((s, svc) => s + (svc.price || 0), 0) * item.quantity
                          : 0
                      return sum + (item.price * item.quantity) + fee
                    }, 0)
                  )
                }</span>
              </div>
              {isPricingLoading && (
                <div className="text-xs text-gray-500 mb-4">
                  Đang tính giá theo số lượng...
                </div>
              )}

              <Link to={ROUTES.CHECKOUT}>
                <Button type="primary" size="large" block>
                  Tiến hành thanh toán
                </Button>
              </Link>

              <Link to={ROUTES.PRODUCTS} className="block mt-4">
                <Button size="large" block>
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
