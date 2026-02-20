import OrderManagement from '@/components/order/OrderManagement'

const StaffOrderManagement = () => {
  return (
    <OrderManagement
      title="Quản lý đơn hàng"
      subtitle="Đơn hàng của chi nhánh"
      canManage={true}
      useAllOrders={true}
    />
  )
}

export default StaffOrderManagement
