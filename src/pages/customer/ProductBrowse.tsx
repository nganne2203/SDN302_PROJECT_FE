import { useEffect, useState } from 'react'
import { useProduct } from '@/hooks/useProduct'
import ProductGrid from '@/components/product/ProductGrid'
import { InputField, SelectField } from '@/components/common'
import type { ProductFilter } from '@/types/api'

const ProductBrowse = () => {
  const {
    products,
    pagination,
    categories,
    isLoading,
    fetchProducts,
    fetchCategories,
    updateFilter,
    resetFilter
  } = useProduct()

  const [localFilter, setLocalFilter] = useState<ProductFilter>({})

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (Object.keys(localFilter).length > 0) {
      const timer = setTimeout(() => {
        updateFilter(localFilter)
        fetchProducts(localFilter)
      }, 500)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilter])

  const handleFilterChange = (field: keyof ProductFilter, value: string | number | boolean | undefined) => {
    setLocalFilter((prev) => ({ ...prev, [field]: value, page: 1 }))
  }

  const handleClearFilter = () => {
    setLocalFilter({})
    resetFilter()
    fetchProducts()
  }

  const handlePageChange = (page: number) => {
    const newFilter = { ...localFilter, page }
    setLocalFilter(newFilter)
    updateFilter(newFilter)
    fetchProducts(newFilter)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const categoryOptions = [
    { value: '', label: 'Tất cả danh mục' },
    ...categories.map((cat) => ({ value: cat._id, label: cat.name }))
  ]

  const sortByOptions = [
    { value: '', label: 'Mặc định' },
    { value: 'price', label: 'Giá' },
    { value: 'name', label: 'Tên sản phẩm' },
    { value: 'ratingAvg', label: 'Đánh giá' },
    { value: 'createdAt', label: 'Mới nhất' }
  ]

  const sortOrderOptions = [
    { value: 'desc', label: 'Giảm dần' },
    { value: 'asc', label: 'Tăng dần' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Danh sách sản phẩm
          </h1>
          <p className="text-gray-600">
            Khám phá bộ sưu tập phụ kiện điện thoại đa dạng của chúng tôi
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField
              label="Tìm kiếm"
              placeholder="Nhập tên sản phẩm..."
              value={localFilter.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />

            <SelectField
              label="Danh mục"
              value={localFilter.categoryId || ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              options={categoryOptions}
            />

            <SelectField
              label="Sắp xếp theo"
              value={localFilter.sortBy || ''}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              options={sortByOptions}
            />

            <SelectField
              label="Thứ tự"
              value={localFilter.sortOrder || 'desc'}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              options={sortOrderOptions}
            />
          </div>

          {Object.keys(localFilter).length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilter}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        {pagination && (
          <div className="mb-4 text-gray-600">
            Hiển thị {products.length} trên {pagination.totalItems} sản phẩm
          </div>
        )}

        {/* Product Grid */}
        <ProductGrid
          products={products}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}

export default ProductBrowse
