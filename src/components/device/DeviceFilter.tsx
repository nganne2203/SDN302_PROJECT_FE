import { FilterCommon } from '@/components/common'
import type { FilterField } from '@/components/common/FilterCommon'
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
  pagination,
  onPageChange,
  onReset
}: DeviceFilterProps) => {
  const filterFields: FilterField[] = [
    {
      key: 'sortBy',
      label: 'Sắp xếp theo',
      type: 'select',
      options: [
        { label: 'Tên', value: 'name' },
        { label: 'Thương hiệu', value: 'brand' },
        { label: 'Model', value: 'model' },
        { label: 'Ngày tạo', value: 'createdAt' },
        { label: 'Ngày cập nhật', value: 'updatedAt' }
      ]
    }
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
      page={pagination?.page || 1}
      limit={pagination?.limit || 10}
      total={pagination?.total || 0}
      onPageChange={onPageChange}
      showPagination={true}
      onReset={onReset}
      showReset={true}
    />
  )
}

export default DeviceFilterComponent
