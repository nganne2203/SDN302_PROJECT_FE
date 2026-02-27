import { useState, useEffect, useCallback } from 'react'
import { Tabs, Table } from 'antd'
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import { LoaderCommon } from '@/components/common'
import OrderStatusBadge from '@/components/order/OrderStatusBadge'
import useOrder from '@/hooks/useOrder'
import { formatCurrency } from '@/utils/formatCurrency'
import type { Order } from '@/types/api'
import type { OrderFilter } from '@/features/order/orderTypes'

const OrderHistory = () => {
  const {
    orders,
    pagination,
    isLoading,
    fetchOrders
  } = useOrder()

  const [activeTab, setActiveTab] = useState<string>('pending')

  // Build filter based on active tab
  const buildFilter = useCallback((): OrderFilter => {
    const baseFilter: OrderFilter = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }

    if (activeTab === 'pending') {
      baseFilter.status = 'pending'
    } else if (activeTab === 'completed') {
      baseFilter.status = 'delivered'
    } else if (activeTab === 'cancelled') {
      baseFilter.status = 'canceled'
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

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'orderId',
      render: (_: unknown, order: Order) => (
        <span className="font-medium text-gray-900">
          {'orderNumber' in order ? (order as { orderNumber: string }).orderNumber : order.id}
        </span>
      )
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'total',
      render: (value: number) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(value)}
        </span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => <OrderStatusBadge status={value} />
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
              rowKey={(order) => order.id}
              pagination={false}
              columns={orderColumns}
            />
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

    </div>
  )
}

export default OrderHistory
