import { FilterCommon } from '@/components/common'
import type { FilterField } from '@/components/common/FilterCommon'
import type { FilterOption } from '@/types/filter'
import type { DeviceFilter } from '@/features/device/deviceTypes'

/* eslint-disable no-unused-vars */
interface DeviceFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filter: DeviceFilter
  onFilterChange: (key: string, value: unknown) => void
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onPageChange: (page: number, pageSize: number) => void
  onReset: () => void
}

const DeviceFilterComponent = ({
  searchValue,
  onSearchChange,
  filter,
  onFilterChange,
  onReset
}: DeviceFilterProps) => {
  const filterFields: FilterField[] = []

  const sortOptions: FilterOption[] = [
    { label: 'Tên', value: 'name' },
    { label: 'Ngày tạo', value: 'createdAt' },
    { label: 'Ngày cập nhật', value: 'updatedAt' }
  ]

  return (
    <FilterCommon
      searchPlaceholder="Tìm kiếm theo tên, thương hiệu hoặc model..."
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      showSearch={true}
      filters={filterFields}
      filterValues={filter as Record<string, unknown>}
      onFilterChange={onFilterChange}
      sortOptions={sortOptions}
      sortBy={filter.sortBy || 'createdAt'}
      sortOrder={filter.sortOrder || 'desc'}
      onSortChange={(field, order) => onFilterChange('sort', { field, order })}
      showSort
      showPagination={false}
      onReset={onReset}
      showReset={true}
      compact
    />
  )
}

export default DeviceFilterComponent
