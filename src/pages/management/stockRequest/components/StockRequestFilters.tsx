import { FilterCommon } from '@/components/common'
import type { FilterField } from '@/components/common/FilterCommon'
import type { StockRequestStatus } from '@/types/api'

/* eslint-disable no-unused-vars */
interface StockRequestFiltersProps {
  isAdmin: boolean
  search: string
  statusFilter: StockRequestStatus | 'all'
  sortBy: 'createdAt' | 'quantity' | 'status'
  sortOrder: 'asc' | 'desc'
  branchId: string
  productId: string
  branchOptions: { label: string; value: string }[]
  productOptions: { label: string; value: string }[]
  onFilterChange: (_key: string, _value: unknown) => void
  onReset: () => void
}

const StockRequestFilters = ({
  isAdmin,
  search,
  statusFilter,
  sortBy,
  sortOrder,
  branchId,
  productId,
  branchOptions,
  productOptions,
  onFilterChange,
  onReset
}: StockRequestFiltersProps) => {
  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'Tất cả trạng thái', value: 'all' },
        { label: 'Chờ duyệt', value: 'pending' },
        { label: 'Đã duyệt', value: 'approved' },
        { label: 'Duyệt một phần', value: 'partially_approved' },
        { label: 'Bị từ chối', value: 'rejected' }
      ]
    },
    {
      key: 'productId',
      label: 'Sản phẩm',
      type: 'select',
      options: [{ label: 'Tất cả sản phẩm', value: 'all' }, ...productOptions]
    }
  ]

  if (isAdmin) {
    filterFields.splice(2, 0, {
      key: 'branchId',
      label: 'Chi nhánh',
      type: 'select',
      options: [{ label: 'Tất cả chi nhánh', value: 'all' }, ...branchOptions]
    })
  }

  const sortOptions = [
    { label: 'Ngày tạo', value: 'createdAt' },
    { label: 'Số lượng', value: 'quantity' },
    { label: 'Trạng thái', value: 'status' }
  ]

  return (
    <FilterCommon
      searchPlaceholder="Tìm theo mã yêu cầu, tên sản phẩm hoặc lý do"
      searchValue={search}
      onSearchChange={(value) => onFilterChange('search', value)}
      showSearch
      filters={filterFields}
      filterValues={{
        status: statusFilter,
        sortOrder,
        branchId,
        productId
      }}
      onFilterChange={onFilterChange}
      sortOptions={sortOptions}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={(field) => onFilterChange('sortBy', field)}
      showSort
      onReset={onReset}
      showReset
      showPagination={false}
      compact
      compactFillRow
      compactSingleRow
    />
  )
}

export default StockRequestFilters
