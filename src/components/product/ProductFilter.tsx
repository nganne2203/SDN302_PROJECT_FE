import { InputField, SelectField, NumberField, ButtonCommon } from '@/components/common'
import type { ProductFilter } from '@/types/api'

interface ProductFilterProps {
  filter: ProductFilter
  categories: { _id: string; name: string; slug: string }[]
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
  const handleChange = (field: keyof ProductFilter, value: string | number | boolean | undefined) => {
    onFilterChange({ ...filter, [field]: value, page: 1 })
  }

  const sortByOptions = [
    { value: '', label: 'Mặc định' },
    { value: 'name', label: 'Tên sản phẩm' },
    { value: 'price', label: 'Giá' },
    { value: 'createdAt', label: 'Ngày tạo' },
    { value: 'updatedAt', label: 'Ngày cập nhật' },
    { value: 'ratingAvg', label: 'Đánh giá' },
    { value: 'ratingCount', label: 'Số lượt đánh giá' }
  ]

  const sortOrderOptions = [
    { value: 'asc', label: 'Tăng dần' },
    { value: 'desc', label: 'Giảm dần' }
  ]

  const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'true', label: 'Đang hoạt động' },
    { value: 'false', label: 'Ngừng hoạt động' }
  ]

  const categoryOptions = [
    { value: '', label: 'Tất cả danh mục' },
    ...categories.map((cat) => ({ value: cat._id, label: cat.name }))
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InputField
          label="Tìm kiếm"
          placeholder="Nhập tên sản phẩm..."
          value={filter.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
        />

        <SelectField
          label="Danh mục"
          value={filter.categoryId || ''}
          onChange={(e) => handleChange('categoryId', e.target.value)}
          options={categoryOptions}
        />

        <SelectField
          label="Trạng thái"
          value={filter.isActive !== undefined ? String(filter.isActive) : ''}
          onChange={(e) => handleChange('isActive', e.target.value ? e.target.value === 'true' : undefined)}
          options={statusOptions}
        />

        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="Giá tối thiểu"
            placeholder="0"
            value={filter.minPrice || ''}
            onChange={(value) => handleChange('minPrice', value ? Number(value) : undefined)}
          />
          <NumberField
            label="Giá tối đa"
            placeholder="0"
            value={filter.maxPrice || ''}
            onChange={(value) => handleChange('maxPrice', value ? Number(value) : undefined)}
          />
        </div>

        <SelectField
          label="Sắp xếp theo"
          value={filter.sortBy || ''}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          options={sortByOptions}
        />

        <SelectField
          label="Thứ tự"
          value={filter.sortOrder || 'desc'}
          onChange={(e) => handleChange('sortOrder', e.target.value)}
          options={sortOrderOptions}
        />
      </div>

      {Object.keys(filter).length > 0 && (
        <div className="mt-4 flex justify-end">
          <ButtonCommon variant="outline" onClick={onClearFilter}>
            Xóa bộ lọc
          </ButtonCommon>
        </div>
      )}
    </div>
  )
}

export default ProductFilterComponent
