import { FilterCommon } from '@/components/common'
import type { FilterField } from '@/components/common/FilterCommon'
import type { FilterOption } from '@/types/filter'
import type { BranchFilter } from '@/types/api'

/* eslint-disable no-unused-vars */
interface BranchFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filter: BranchFilter
  onFilterChange: (key: string, value: unknown) => void
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onPageChange: (page: number, pageSize: number) => void
  onReset: () => void
}

const BranchFilterComponent = ({
  searchValue,
  onSearchChange,
  filter,
  onFilterChange,
  pagination,
  onPageChange,
  onReset
}: BranchFilterProps) => {
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
    { label: 'Tên chi nhánh', value: 'name' }
  ]

  const filterValues = {
    ...filter,
    isActive: typeof filter.isActive === 'boolean' ? String(filter.isActive) : filter.isActive
  }

  return (
    <FilterCommon
      searchPlaceholder="Tìm kiếm theo tên hoặc địa chỉ"
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      showSearch
      filters={filterFields}
      filterValues={filterValues as Record<string, unknown>}
      onFilterChange={onFilterChange}
      sortOptions={sortOptions}
      sortBy={(filter.sortBy as string) || 'createdAt'}
      sortOrder={(filter.sortOrder as 'asc' | 'desc') || 'desc'}
      onSortChange={(field, order) => onFilterChange('sort', { field, order })}
      showSort
      page={pagination?.page || 1}
      limit={pagination?.limit || 10}
      total={pagination?.total || 0}
      onPageChange={onPageChange}
      showPagination
      onReset={onReset}
      showReset
      compact
    />
  )
}

export default BranchFilterComponent

