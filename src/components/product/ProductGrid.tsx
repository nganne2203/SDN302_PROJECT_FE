import { LoaderCommon, PaginationCommon } from '@/components/common'
import ProductCard from './ProductCard'
import type { Product, PaginationMeta } from '@/types/api'

interface ProductGridProps {
  products: Product[]
  pagination: PaginationMeta | null
  isLoading: boolean
  // eslint-disable-next-line no-unused-vars
  onPageChange?: (page: number) => void
}

const ProductGrid = ({
  products,
  pagination,
  isLoading,
  onPageChange
}: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoaderCommon size="lg" />
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg
          className="w-24 h-24 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Không tìm thấy sản phẩm
        </h3>
        <p className="text-gray-500">
          Hãy thử tìm kiếm với từ khóa khác
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex justify-center mt-8">
          <PaginationCommon
            current={pagination.currentPage}
            pageSize={pagination.pageSize}
            total={pagination.totalItems}
            onChange={(page) => onPageChange(page)}
          />
        </div>
      )}
    </div>
  )
}

export default ProductGrid
