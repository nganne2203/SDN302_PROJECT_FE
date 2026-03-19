import { FilterCommon } from '../common'
import type { FilterField } from '@/components/common/FilterCommon'
import type { ServiceProductFilter as FilterType } from '@/features/serviceProduct/serviceProductTypes'

/* eslint-disable no-unused-vars */
const ServiceProductFilter = ({
  filter,
  onFilterChange,
  onReset
}: {
  filter: FilterType
  onFilterChange: (key: string, value: unknown) => void
  onReset: () => void
}) => {
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
    },
    {
      key: 'sortOrder',
      label: 'Thứ tự',
      type: 'select',
      options: [
        { label: 'Giảm dần', value: 'desc' },
        { label: 'Tăng dần', value: 'asc' }
      ]
    }
  ]

  const sortOptions = [
    { label: 'Ngày tạo', value: 'createdAt' },
    { label: 'Ngày cập nhật', value: 'updatedAt' },
    { label: 'Giá dịch vụ', value: 'price' },
    { label: 'Tên dịch vụ', value: 'name' }
  ]

  return (
    <FilterCommon
      searchPlaceholder='Tìm kiếm tên dịch vụ, sản phẩm...'
      searchValue={filter.search || ''}
      onSearchChange={(value) => onFilterChange('search', value)}
      showSearch
      filters={filterFields}
      filterValues={{
        ...filter,
        isActive: filter.isActive === true ? 'true' : filter.isActive === false ? 'false' : ''
      }}
      onFilterChange={onFilterChange}
      sortOptions={sortOptions}
      sortBy={filter.sortBy || 'createdAt'}
      sortOrder={filter.sortOrder || 'desc'}
      onSortChange={(field, order) => onFilterChange('sort', { field, order })}
      showSort
      onReset={onReset}
      showReset
      compact
      compactFillRow
      compactSingleRow
    />
  )
}

export default ServiceProductFilter