import { ButtonCommon, PaginationCommon } from '@/components/common'
import type { Product, PaginationMeta } from '@/types/api'
import { formatCurrency } from '@/utils/formatCurrency'

interface ProductListProps {
  products: Product[]
  pagination: PaginationMeta | null
  isLoading: boolean
  // eslint-disable-next-line no-unused-vars
  onEdit: (product: Product) => void
  // eslint-disable-next-line no-unused-vars
  onDelete: (id: string) => void
  // eslint-disable-next-line no-unused-vars
  onToggleStatus: (id: string, currentStatus: boolean) => void
  // eslint-disable-next-line no-unused-vars
  onPageChange: (page: number) => void
}

const ProductList = ({
  products,
  pagination,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  onPageChange
}: ProductListProps) => {
  const columns = [
    {
      key: 'image',
      label: 'Hình ảnh',
      render: (product: Product) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Tên sản phẩm',
      render: (product: Product) => (
        <div>
          <div className="font-medium text-gray-900">{product.name}</div>
          <div className="text-sm text-gray-500">{product.category.name}</div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (product: Product) => (
        <div className="max-w-xs truncate text-gray-600">
          {product.description}
        </div>
      )
    },
    {
      key: 'price',
      label: 'Giá',
      render: (product: Product) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(product.price)}
        </span>
      )
    },
    {
      key: 'material',
      label: 'Chất liệu',
      render: (product: Product) => (
        <span className="text-gray-600">{product.material || '-'}</span>
      )
    },
    {
      key: 'rating',
      label: 'Đánh giá',
      render: (product: Product) => (
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium">{product.ratingAvg.toFixed(1)}</span>
          <span className="text-xs text-gray-500">({product.ratingCount})</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (product: Product) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            product.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {product.isActive ? 'Hoạt động' : 'Ngừng'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <ButtonCommon
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
          >
            Sửa
          </ButtonCommon>
          <ButtonCommon
            variant={product.isActive ? 'outline' : 'primary'}
            size="sm"
            onClick={() => onToggleStatus(product._id, product.isActive)}
          >
            {product.isActive ? 'Tắt' : 'Bật'}
          </ButtonCommon>
          <ButtonCommon
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                onDelete(product._id)
              }
            }}
          >
            Xóa
          </ButtonCommon>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    Không có sản phẩm nào
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                        {column.render(product)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <PaginationCommon
          current={pagination.currentPage}
          pageSize={pagination.pageSize}
          total={pagination.totalItems}
          onChange={(page) => onPageChange(page)}
        />
      )}
    </div>
  )
}

export default ProductList
