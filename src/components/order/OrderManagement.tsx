import { useState, useEffect, useCallback } from 'react'
import OrderHeader from '@/components/order/OrderHeader'
import OrderFilterComponent from '@/components/order/OrderFilter'
import OrderList from '@/components/order/OrderList'
import OrderDetailModal from '@/components/order/OrderDetailModal'
import useOrder from '@/hooks/useOrder'
import { toast } from '@/utils/toast'
import type { Order } from '@/types/api'
import type { OrderFilter } from '@/features/order/orderTypes'

interface OrderManagementProps {
  title?: string
  subtitle?: string
  canManage?: boolean
  useAllOrders?: boolean
}

const OrderManagement = ({
  title = 'Quản lý đơn hàng',
  subtitle,
  canManage = true,
  useAllOrders = true
}: OrderManagementProps) => {
  const {
    orders,
    pagination,
    isLoading,
    fetchAllOrders,
    fetchOrders,
    fetchOrderById,
    updateOrderStatus,
    cancelOrder
  } = useOrder()

  const [filter, setFilter] = useState<OrderFilter>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Fetch orders based on role
  const loadOrders = useCallback(() => {
    if (useAllOrders) {
      fetchAllOrders(filter)
    } else {
      fetchOrders(filter)
    }
  }, [filter, useAllOrders, fetchAllOrders, fetchOrders])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleFilterChange = (newFilter: OrderFilter) => {
    setFilter(newFilter)
  }

  const handleResetFilter = () => {
    setFilter({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const handleViewDetail = async (order: Order) => {
    const withMongoId = order as unknown as { _id?: string }
    const orderId = withMongoId._id || order.id

    setSelectedOrder(order)
    setIsDetailModalOpen(true)

    if (!orderId) {
      toast.error('Không tìm thấy mã đơn hàng để tải chi tiết')
      return
    }

    const detailedOrder = await fetchOrderById(orderId)
    if (detailedOrder) {
      setSelectedOrder(detailedOrder)
    }
  }

  const handleUpdateStatus = async (orderId: string, status: string) => {
    const updatedOrder = await updateOrderStatus(orderId, status)
    if (updatedOrder) {
      toast.success('Cập nhật trạng thái đơn hàng thành công')
      // Update local selectedOrder if the modal is showing this order
      if (selectedOrder) {
        const withMongoId = selectedOrder as unknown as { _id?: string }
        const selectedId = withMongoId._id || selectedOrder.id
        if (selectedId === orderId) {
          setSelectedOrder(updatedOrder)
        }
      }
    } else {
      toast.error('Không thể cập nhật trạng thái đơn hàng')
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return
    }

    const cancelledOrder = await cancelOrder(orderId, 'Hủy bởi quản trị viên')
    if (cancelledOrder) {
      toast.success('Hủy đơn hàng thành công')
      // Update local selectedOrder if the modal is showing this order
      if (selectedOrder) {
        const withMongoId = selectedOrder as unknown as { _id?: string }
        const selectedId = withMongoId._id || selectedOrder.id
        if (selectedId === orderId) {
          setSelectedOrder(cancelledOrder)
        }
      }
    } else {
      toast.error('Không thể hủy đơn hàng')
    }
  }

  const handleRefresh = () => {
    loadOrders()
  }

  const handlePageChange = (page: number) => {
    setFilter({ ...filter, page })
  }

  return (
    <div className="space-y-6">
      <OrderHeader
        title={title}
        subtitle={subtitle}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      <OrderFilterComponent
        filter={filter}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilter}
      />

      <OrderList
        orders={orders}
        pagination={pagination}
        isLoading={isLoading}
        onViewDetail={handleViewDetail}
        onUpdateStatus={canManage ? handleUpdateStatus : undefined}
        onCancelOrder={canManage ? handleCancelOrder : undefined}
        onPageChange={handlePageChange}
        canManage={canManage}
      />

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdateStatus={canManage ? handleUpdateStatus : undefined}
        onCancelOrder={canManage ? handleCancelOrder : undefined}
        canManage={canManage}
      />
    </div>
  )
}

export default OrderManagement
