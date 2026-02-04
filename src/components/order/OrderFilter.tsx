import { FilterCommon } from '@/components/common'
import type { FilterField } from '@/components/common/FilterCommon'
import type { OrderFilter } from '@/features/order/orderTypes'

interface OrderFilterProps {
  filter: OrderFilter
  // eslint-disable-next-line no-unused-vars
  onFilterChange: (filter: OrderFilter) => void
  onReset: () => void
}

const OrderFilterComponent = ({ filter, onFilterChange, onReset }: OrderFilterProps) => {
  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      placeholder: 'Tất cả trạng thái',
      options: [
        { label: 'Chờ xác nhận', value: 'pending' },
        { label: 'Đã xác nhận', value: 'confirmed' },
        { label: 'Đang giao', value: 'shipped' },
        { label: 'Đã giao', value: 'delivered' },
        { label: 'Đã hủy', value: 'canceled' }
      ],
      allowClear: true
    }
  ]

  return (
    <FilterCommon
      showSearch
      searchPlaceholder="Tìm theo mã đơn, khách hàng..."
      searchValue={filter.search || ''}
      onSearchChange={(value) => onFilterChange({ ...filter, search: value, page: 1 })}
      filters={filterFields}
      filterValues={{
        status: filter.status || ''
      }}
      onFilterChange={(key, value) => {
        onFilterChange({ ...filter, [key]: value || undefined, page: 1 })
      }}
      sortOptions={[
        { label: 'Ngày tạo', value: 'createdAt' },
        { label: 'Tổng tiền', value: 'totalAmount' },
        { label: 'Mã đơn hàng', value: 'orderNumber' }
      ]}
      sortBy={filter.sortBy || 'createdAt'}
      sortOrder={filter.sortOrder || 'desc'}
      onSortChange={(field, order) => {
        onFilterChange({
          ...filter,
          sortBy: field as OrderFilter['sortBy'],
          sortOrder: order as OrderFilter['sortOrder'],
          page: 1
        })
      }}
      onReset={onReset}
      showPagination={false}
      compact={true}
    />
  )
}

export default OrderFilterComponent
