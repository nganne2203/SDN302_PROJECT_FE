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

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      render: (_: unknown, record: (typeof cartItems)[0]) => {
        const pricing = getItemPricing(record.id)?.pricing
        const unitPrice = pricing?.pricePerUnit ?? record.price
        const discountPercent = pricing?.discountPercentage ?? 0
        const originalUnitPrice = pricing?.originalTotal && record.quantity > 0
          ? pricing.originalTotal / record.quantity
          : record.price
        const imageUrl = getProductImageUrl(record.product.images)

        return (
          <div className="flex items-center gap-4">
            <img
              src={imageUrl || undefined}
              alt={record.product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h4 className="font-medium text-gray-800">{record.product.name}</h4>
              <div className="flex items-center gap-2">
                <p className="text-blue-600 font-semibold">
                  {formatCurrency(unitPrice)}
                </p>
                {discountPercent > 0 && originalUnitPrice > unitPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatCurrency(Math.round(originalUnitPrice))}
                  </span>
                )}
              </div>
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
        const productId = record.productId || record.product?._id
        return (
          <InputNumber
            min={1}
            max={99}
            value={record.quantity}
            onChange={(value) => {
              if (productId) updateQuantity(productId, value)
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
        const pricing = getItemPricing(record.id)?.pricing
        const itemTotal = pricing?.totalPrice ?? record.price * record.quantity
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
        const productId = record.productId || record.product?._id
        return (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              if (productId) removeItem(productId)
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
                rowKey={(record) => record.id || record.productId || record.product?._id || ''}
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
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-800 mb-6">
                <span>Tổng cộng</span>
                <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
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
