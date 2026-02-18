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
      label: 'Sap xep theo',
      type: 'select',
      options: [
        { label: 'Ten', value: 'name' },
        { label: 'Thuong hieu', value: 'brand' },
        { label: 'Model', value: 'model' },
        { label: 'Ngay tao', value: 'createdAt' },
        { label: 'Ngay cap nhat', value: 'updatedAt' }
      ]
    }
  ]

  return (
    <FilterCommon
      searchPlaceholder="Tim kiem theo ten, thuong hieu hoac model..."
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
