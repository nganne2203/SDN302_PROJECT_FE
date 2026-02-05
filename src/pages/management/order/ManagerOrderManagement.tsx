import OrderManagement from '@/components/order/OrderManagement'

const ManagerOrderManagement = () => {
  return (
    <OrderManagement
      title="Quản lý đơn hàng"
      subtitle="Quản lý đơn hàng của chi nhánh"
      canManage={true}
      useAllOrders={true}
    />
  )
}

export default ManagerOrderManagement
