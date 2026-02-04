import OrderManagement from '@/components/order/OrderManagement'

const AdminOrderManagement = () => {
  return (
    <OrderManagement
      title="Quản lý đơn hàng"
      subtitle="Tất cả đơn hàng từ các chi nhánh"
      canManage={true}
      useAllOrders={true}
    />
  )
}

export default AdminOrderManagement
