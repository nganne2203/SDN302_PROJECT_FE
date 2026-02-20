import { FilterCommon } from '@/components/common'
import type { FilterField } from '@/components/common/FilterCommon'
import type { FilterOption } from '@/types/filter'

/* eslint-disable no-unused-vars */
interface CustomerFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  isActive?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onFilterChange: (key: string, value: unknown) => void
  onReset: () => void
}

/**
 * Filter bar for customer lists — search + status only (no role filter).
 */
const CustomerFilter = ({
  searchValue,
  onSearchChange,
  isActive,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onFilterChange,
  onReset
}: CustomerFilterProps) => {
  const filterFields: FilterField[] = [
    {
      key: 'isActive',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'Tất cả', value: '' },
        { label: 'Hoạt động', value: 'true' },
        { label: 'Vô hiệu hóa', value: 'false' }
      ]
    }
  ]

  const sortOptions: FilterOption[] = [
    { label: 'Ngày tạo', value: 'createdAt' },
    { label: 'Tên', value: 'fullname' },
    { label: 'Email', value: 'email' }
  ]

  return (
    <FilterCommon
      searchPlaceholder="Tìm kiếm theo tên, email hoặc số điện thoại"
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      showSearch
      filters={filterFields}
      filterValues={{ isActive: isActive ?? '' }}
      onFilterChange={onFilterChange}
      sortOptions={sortOptions}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={(field, order) => onFilterChange('sort', { field, order })}
      showSort
      onReset={onReset}
      showReset
      compact
    />
  )
}

export default CustomerFilter
