import { useState, useEffect, useCallback } from 'react'
import { Tabs, Table, Button, Pagination, Modal } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LoaderCommon } from '@/components/common'
import OrderStatusBadge from '@/components/order/OrderStatusBadge'
import ReviewModal from '@/components/review/ReviewModal'
import useOrder from '@/hooks/useOrder'
import { formatCurrency } from '@/utils/formatCurrency'
import { getProductImageUrl } from '@/utils/imageHelper'
import { getOrderPaymentDisplay } from '@/utils/orderPayment'
import { ROUTES } from '@/constants/constant'
import type { Order } from '@/types/api'
import type { OrderFilter } from '@/features/order/orderTypes'

interface ProductReviewTarget {
  productId: string
  productName: string
  productImage?: string
}

const OrderHistory = () => {
  const navigate = useNavigate()
  const {
    orders,
    pagination,
    isLoading,
    fetchOrders
  } = useOrder()

  const [activeTab, setActiveTab] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null)
  const [selectedProductForReview, setSelectedProductForReview] = useState<ProductReviewTarget | null>(null)
  const [isReviewPickerOpen, setIsReviewPickerOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  const getOrderId = (order: Order): string => {
    const withMongoId = order as unknown as { _id?: string }
    return withMongoId._id || order.id
  }

  const getOrderStatus = (order: Order): string => {
    const withOrderStatus = order as unknown as { orderStatus?: string; status?: string }
    return String(withOrderStatus.orderStatus || withOrderStatus.status || '').toLowerCase()
  }

  const isDeliveredOrder = (order: Order): boolean => {
    const status = getOrderStatus(order)
    const deliveryStatus = String((order as unknown as { delivery?: { status?: string } }).delivery?.status || '').toLowerCase()
    return status === 'delivered' || deliveryStatus === 'delivered'
  }

  const getReviewTargetsFromOrder = (order: Order): ProductReviewTarget[] => {
    const items = Array.isArray(order.items) ? order.items : []

    const targets: ProductReviewTarget[] = []

    items.forEach((item) => {
      const normalized = item as unknown as {
        productId?: string
        productName?: string
        productImage?: string
        product?: {
          _id?: string
          name?: string
          images?: string[] | string
        }
      }

      const productId = normalized.product?._id || normalized.productId
      if (!productId) return

      const productName = normalized.product?.name || normalized.productName || 'Sản phẩm'
      const productImage = normalized.product?.images
        ? getProductImageUrl(normalized.product.images as never)
        : normalized.productImage

      targets.push({
        productId,
        productName,
        productImage
      })
    })

    const uniqueTargets = Array.from(
      new Map(targets.map((target) => [target.productId, target])).values()
    )

    return uniqueTargets
  }

  // Build filter based on active tab
  const buildFilter = useCallback((): OrderFilter => {
    const baseFilter: OrderFilter = {
      page: currentPage,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }

    if (activeTab === 'pending') {
      baseFilter.status = 'pending'
    } else if (activeTab === 'confirmed') {
      baseFilter.status = 'confirmed'
    } else if (activeTab === 'shipped') {
      baseFilter.status = 'shipped'
    } else if (activeTab === 'completed') {
      baseFilter.status = 'delivered'
    } else if (activeTab === 'cancelled') {
      baseFilter.status = 'cancelled'
    }
    // 'all' tab: no status filter → returns all orders sorted by newest

    return baseFilter
  }, [activeTab, currentPage])

  const loadOrders = useCallback(() => {
    fetchOrders(buildFilter())
  }, [buildFilter, fetchOrders])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    setCurrentPage(1)
  }

  const handleOpenReviewPicker = (order: Order) => {
    setSelectedOrderForReview(order)
    setSelectedProductForReview(null)
    setIsReviewPickerOpen(true)
  }

  const handleSelectReviewProduct = (target: ProductReviewTarget) => {
    setSelectedProductForReview(target)
    setIsReviewPickerOpen(false)
    setIsReviewModalOpen(true)
  }

  const handleReviewSuccess = () => {
    loadOrders()
    setIsReviewModalOpen(false)
    setSelectedProductForReview(null)
  }

  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'orderId',
      render: (_: unknown, order: Order) => (
        <span className="font-medium text-gray-900">
          {'orderNumber' in order
            ? (order as { orderNumber: string }).orderNumber
            : order.id}
        </span>
      )
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString('vi-VN') : '—'
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'total',
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(value)}
        </span>
      )
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'payment',
      render: (value: string, record: Order) => {
        const paymentDisplay = getOrderPaymentDisplay(record, value)
        return (
          <span className={
            paymentDisplay.tone === 'success' ? 'text-green-600' :
              paymentDisplay.tone === 'warning' ? 'text-yellow-600' :
                paymentDisplay.tone === 'error' ? 'text-red-600' : 'text-gray-600'
          }>{paymentDisplay.label}</span>
        )
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      key: 'status',
      render: (value: string, record: Order) => (
        <OrderStatusBadge status={value ?? (record as unknown as Record<string, string>).status} />
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center' as const,
      render: (_: unknown, order: Order) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              const id = getOrderId(order)
              navigate(ROUTES.ORDER_DETAIL.replace(':id', id))
            }}
          >
            Xem chi tiết
          </Button>
          {isDeliveredOrder(order) && getReviewTargetsFromOrder(order).length > 0 && (
            <Button
              size="small"
              onClick={() => handleOpenReviewPicker(order)}
            >
              Đánh giá
            </Button>
          )}
        </div>
      )
    }
  ]

  const reviewTargets = selectedOrderForReview ? getReviewTargetsFromOrder(selectedOrderForReview) : []

  const tabItems = [
    {
      key: 'all',
      label: (
        <span className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          Tất cả
        </span>
      )
    },
    {
      key: 'confirmed',
      label: (
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Đang xử lý
        </span>
      )
    },
    {
      key: 'shipped',
      label: (
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Đang giao hàng
        </span>
      )
    },
    {
      key: 'completed',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Hoàn thành
        </span>
      )
    },
    {
      key: 'cancelled',
      label: (
        <span className="flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          Đã hủy
        </span>
      )
    }
  ]

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoaderCommon />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Đơn hàng của tôi</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý đơn hàng của bạn</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 px-4">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
          />
        </div>

        {/* Order List */}
        <div className="bg-white rounded-lg shadow p-4">
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có đơn hàng
              </h3>
              <p className="text-gray-500">
                Không có đơn hàng
              </p>
            </div>
          ) : (
            <Table
              dataSource={orders}
              rowKey={(order) => (order as unknown as { _id: string })._id || order.id}
              pagination={false}
              columns={orderColumns}
              loading={isLoading}
            />
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              current={currentPage}
              total={pagination.totalItems}
              pageSize={10}
              showSizeChanger={false}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      <Modal
        open={isReviewPickerOpen}
        title="Chọn sản phẩm để đánh giá"
        onCancel={() => setIsReviewPickerOpen(false)}
        footer={null}
      >
        <div className="space-y-3">
          {reviewTargets.map((target) => (
            <div
              key={target.productId}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 shrink-0">
                  {target.productImage && (
                    <img src={target.productImage} alt={target.productName} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 max-w-[320px] overflow-hidden whitespace-nowrap text-ellipsis" title={target.productName}>
                    {target.productName}
                  </p>
                </div>
              </div>

              <Button type="primary" size="small" onClick={() => handleSelectReviewProduct(target)}>
                Đánh giá
              </Button>
            </div>
          ))}

          {reviewTargets.length === 0 && (
            <p className="text-sm text-gray-500">Không tìm thấy sản phẩm để đánh giá trong đơn hàng này.</p>
          )}
        </div>
      </Modal>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false)
          setSelectedProductForReview(null)
        }}
        productId={selectedProductForReview?.productId || ''}
        productName={selectedProductForReview?.productName}
        onSuccess={handleReviewSuccess}
      />

    </div>
  )
}

export default OrderHistory
