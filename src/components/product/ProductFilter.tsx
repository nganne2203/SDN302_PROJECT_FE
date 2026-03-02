import { FilterCommon } from '@/components/common'
import type { FilterField } from '@/components/common/FilterCommon'
import type { ProductFilter } from '@/types/api'

interface ProductFilterProps {
  filter: ProductFilter
  categories: { id: string; name: string; slug: string }[]
  // eslint-disable-next-line no-unused-vars
  onFilterChange: (filter: ProductFilter) => void
  onClearFilter: () => void
}

const ProductFilterComponent = ({
  filter,
  categories,
  onFilterChange,
  onClearFilter
}: ProductFilterProps) => {
  const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }))

  const statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Đang hoạt động', value: 'true' },
    { label: 'Ngừng hoạt động', value: 'false' }
  ]

  const sortByOptions = [
    { label: 'Mặc định', value: '' },
    { label: 'Tên sản phẩm', value: 'name' },
    { label: 'Giá', value: 'price' },
    { label: 'Ngày tạo', value: 'createdAt' },
    { label: 'Ngày cập nhật', value: 'updatedAt' },
    { label: 'Đánh giá', value: 'ratingAvg' },
    { label: 'Số lượt đánh giá', value: 'ratingCount' }
  ]

  const filterFields: FilterField[] = [
    {
      key: 'categoryId',
      label: 'Danh mục',
      type: 'select',
      options: categoryOptions
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      type: 'select',
      options: statusOptions
    },
    {
      key: 'sortBy',
      label: 'Sắp xếp theo',
      type: 'select',
      options: sortByOptions
    }
  ]

  const handleFilterChange = (key: string, value: unknown) => {
    if (key === 'isActive') {
      const boolVal = value ? (value as string) === 'true' : undefined
      onFilterChange({ ...filter, [key]: boolVal, page: 1 })
    } else {
      onFilterChange({ ...filter, [key]: value, page: 1 })
    }
  }

  return (
    <FilterCommon
      searchPlaceholder="Tìm kiếm theo tên sản phẩm..."
      searchValue={filter.search || ''}
      onSearchChange={(value) => onFilterChange({ ...filter, search: value, page: 1 })}
      showSearch={true}
      filters={filterFields}
      filterValues={filter as Record<string, unknown>}
      onFilterChange={handleFilterChange}
      showPagination={false}
      onReset={onClearFilter}
      showReset={true}
      showSort={false}
    />
  )
}

export default ProductFilterComponent
