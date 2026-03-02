import { useState, useEffect, useCallback } from 'react'
import { Tabs, Table, Button, Pagination } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LoaderCommon } from '@/components/common'
import OrderStatusBadge from '@/components/order/OrderStatusBadge'
import useOrder from '@/hooks/useOrder'
import { formatCurrency } from '@/utils/formatCurrency'
import { ROUTES } from '@/constants/constant'
import type { Order } from '@/types/api'
import type { OrderFilter } from '@/features/order/orderTypes'

const OrderHistory = () => {
  const navigate = useNavigate()
  const {
    orders,
    pagination,
    isLoading,
    fetchOrders
  } = useOrder()

  const [activeTab, setActiveTab] = useState<string>('pending')
  const [currentPage, setCurrentPage] = useState(1)

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
      baseFilter.status = 'canceled'
    }

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
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      key: 'status',
      render: (value: string, record: Order) => (
        <OrderStatusBadge status={value ?? (record as unknown as Record<string, string>).status} />
      )
    },
    {
      title: 'Thảo tác',
      key: 'actions',
      align: 'center' as const,
      render: (_: unknown, order: Order) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            const id = (order as unknown as { _id: string })._id || order.id
            navigate(ROUTES.ORDER_DETAIL.replace(':id', id))
          }}
        >
          Xem chi tiết
        </Button>
      )
    }
  ]

  const tabItems = [
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

    </div>
  )
}

export default OrderHistory
