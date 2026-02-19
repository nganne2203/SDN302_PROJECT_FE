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
    { label: 'Tat ca', value: '' },
    { label: 'Dang hoat dong', value: 'true' },
    { label: 'Ngung hoat dong', value: 'false' }
  ]

  const sortByOptions = [
    { label: 'Mac dinh', value: '' },
    { label: 'Ten san pham', value: 'name' },
    { label: 'Gia', value: 'price' },
    { label: 'Ngay tao', value: 'createdAt' },
    { label: 'Ngay cap nhat', value: 'updatedAt' },
    { label: 'Danh gia', value: 'ratingAvg' },
    { label: 'So luot danh gia', value: 'ratingCount' }
  ]

  const filterFields: FilterField[] = [
    {
      key: 'categoryId',
      label: 'Danh muc',
      type: 'select',
      options: categoryOptions
    },
    {
      key: 'isActive',
      label: 'Trang thai',
      type: 'select',
      options: statusOptions
    },
    {
      key: 'sortBy',
      label: 'Sap xep theo',
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
      searchPlaceholder="Tim kiem theo ten san pham..."
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
