import { useState } from 'react'
import { Table, InputNumber, Button, Empty, message } from 'antd'
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/utils/formatCurrency'
import { ROUTES } from '@/constants/constant'

// Temporary mock data
const mockCartItems = [
  {
    id: '1',
    productId: 'p1',
    product: {
      id: 'p1',
      name: 'Ốp lưng iPhone 15 Pro Max',
      images: ['https://via.placeholder.com/100'],
      price: 199000,
    },
    quantity: 2,
    price: 199000,
  },
  {
    id: '2',
    productId: 'p2',
    product: {
      id: 'p2',
      name: 'Sạc nhanh 20W Apple',
      images: ['https://via.placeholder.com/100'],
      price: 450000,
    },
    quantity: 1,
    price: 450000,
  },
]

const Cart = () => {
  const [cartItems, setCartItems] = useState(mockCartItems)

  const handleQuantityChange = (id: string, quantity: number | null) => {
    if (quantity && quantity > 0) {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      )
    }
  }

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
    message.success('Đã xóa sản phẩm khỏi giỏ hàng')
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      render: (_: unknown, record: (typeof cartItems)[0]) => (
        <div className="flex items-center gap-4">
          <img
            src={record.product.images[0]}
            alt={record.product.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div>
            <h4 className="font-medium text-gray-800">{record.product.name}</h4>
            <p className="text-blue-600 font-semibold">
              {formatCurrency(record.price)}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      render: (_: unknown, record: (typeof cartItems)[0]) => (
        <InputNumber
          min={1}
          max={99}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
          className="w-20"
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: 150,
      render: (_: unknown, record: (typeof cartItems)[0]) => (
        <span className="font-semibold text-gray-800">
          {formatCurrency(record.price * record.quantity)}
        </span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: unknown, record: (typeof cartItems)[0]) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
        />
      ),
    },
  ]

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
                rowKey="id"
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
                  <span>Tạm tính ({cartItems.length} sản phẩm)</span>
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
