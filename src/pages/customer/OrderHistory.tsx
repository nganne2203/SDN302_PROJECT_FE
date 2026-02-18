import { useState, useEffect, useCallback } from 'react'
import { Tabs } from 'antd'
import { Package, Clock, Truck, CheckCircle, XCircle, Eye, Star } from 'lucide-react'
import { ButtonCommon, LoaderCommon } from '@/components/common'
import OrderStatusBadge from '@/components/order/OrderStatusBadge'
import OrderDetailModal from '@/components/order/OrderDetailModal'
import ReviewModal from '@/components/review/ReviewModal'
import useOrder from '@/hooks/useOrder'
import { toast } from '@/utils/toast'
import { formatCurrency } from '@/utils/formatCurrency'
import type { Order } from '@/types/api'
import type { OrderFilter } from '@/features/order/orderTypes'

const OrderHistory = () => {
  const {
    orders,
    pagination,
    isLoading,
    fetchOrders,
    cancelOrder
  } = useOrder()

  const [activeTab, setActiveTab] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<{ productId: string; productName: string; orderId: string } | null>(null)

  // Build filter based on active tab
  const buildFilter = useCallback((): OrderFilter => {
    const baseFilter: OrderFilter = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }

    if (activeTab !== 'all') {
      baseFilter.status = activeTab as OrderFilter['status']
    }

    return baseFilter
  }, [activeTab])

  const loadOrders = useCallback(() => {
    fetchOrders(buildFilter())
  }, [buildFilter, fetchOrders])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return
    }

    const success = await cancelOrder(orderId, 'Hủy bởi khách hàng')
    if (success) {
      toast.success('Hủy đơn hàng thành công')
      loadOrders()
    } else {
      toast.error('Không thể hủy đơn hàng')
    }
  }

  const handleOpenReview = (productId: string, productName: string, orderId: string) => {
    setReviewTarget({ productId, productName, orderId })
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
      key: 'pending',
      label: (
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Chờ xác nhận
        </span>
      )
    },
    {
      key: 'confirmed',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Đã xác nhận
        </span>
      )
    },
    {
      key: 'shipped',
      label: (
        <span className="flex items-center gap-2">
          <Truck className="w-4 h-4" />
          Đang giao
        </span>
      )
    },
    {
      key: 'delivered',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Đã giao
        </span>
      )
    },
    {
      key: 'canceled',
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
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có đơn hàng
              </h3>
              <p className="text-gray-500">
                {activeTab === 'all'
                  ? 'Bạn chưa có đơn hàng nào'
                  : 'Không có đơn hàng nào ở trạng thái này'}
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          Mã đơn: {('orderNumber' in order ? (order as { orderNumber: string }).orderNumber : order.id.slice(0, 8))}
                        </h3>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-gray-500">
                        Đặt ngày: {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="space-y-2">
                      {order.items.slice(0, 2).map((item, index) => {
                        const product = typeof item.productId === 'object' ? item.productId : { name: 'Unknown', images: [], _id: '' }
                        const productId = typeof item.productId === 'object' ? (item.productId as { _id?: string })._id ?? '' : item.productId
                        const isDelivered = order.status.toLowerCase() === 'delivered'
                        return (
                          <div key={index} className="flex items-center gap-3">
                            <img
                              src={product.images?.[0] || '/placeholder.png'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Số lượng: {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(item.price)}
                              </p>
                              {isDelivered && productId && (
                                <button
                                  onClick={() => handleOpenReview(productId, product.name, order.id)}
                                  className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-full hover:bg-yellow-100 transition-colors"
                                >
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  Đánh giá
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {order.items.length > 2 && (
                        <p className="text-sm text-gray-500">
                          Và {order.items.length - 2} sản phẩm khác...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-end border-t border-gray-100 pt-4">
                    <ButtonCommon
                      variant="outline"
                      size="md"
                      onClick={() => handleViewDetail(order)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </ButtonCommon>
                    {order.status && order.status.toLowerCase() === 'pending' && (
                      <ButtonCommon
                        variant="danger"
                        size="md"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Hủy đơn
                      </ButtonCommon>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="bg-white rounded-lg shadow px-6 py-3">
              <p className="text-sm text-gray-600">
                Trang {pagination.currentPage} / {pagination.totalPages}
                {' '}({pagination.totalItems} đơn hàng)
              </p>
            </div>
          </div>
        )}
      </div>

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onCancelOrder={handleCancelOrder}
        canManage={false}
      />

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          productId={reviewTarget.productId}
          productName={reviewTarget.productName}
          orderId={reviewTarget.orderId}
          onSuccess={() => setReviewTarget(null)}
        />
      )}
    </div>
  )
}

export default OrderHistory
