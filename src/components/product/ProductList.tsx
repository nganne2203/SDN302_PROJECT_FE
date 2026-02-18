import { Button, Space, Popconfirm, Tooltip } from 'antd'
import { Edit, Trash2, Power } from 'lucide-react'
import { TableCommon } from '@/components/common'
import type { TableColumn } from '@/components/common/TableCommon'
import type { Product, PaginationMeta } from '@/types/api'
import { formatCurrency } from '@/utils/formatCurrency'

interface ProductWithKey extends Record<string, unknown> {
  key: string
  _id: string
}

/* eslint-disable no-unused-vars */
interface ProductListProps {
  products: Product[]
  pagination: PaginationMeta | null
  isLoading: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onToggleStatus: (id: string, currentStatus: boolean) => void
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
  const productsWithKeys: ProductWithKey[] = products.map((p) => ({
    ...p,
    key: p._id
  }))

  const columns: TableColumn<ProductWithKey>[] = [
    {
      key: 'image',
      title: 'Hình ảnh',
      width: 80,
      render: (_: unknown, record: ProductWithKey) => {
        const product = record as unknown as Product
        return (
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0].imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'name',
      title: 'Tên sản phẩm',
      width: 200,
      sortable: true,
      render: (_: unknown, record: ProductWithKey) => {
        const product = record as unknown as Product
        return (
          <div>
            <div className="font-medium text-gray-900">{product.name}</div>
            <div className="text-sm text-gray-500">{product.category?.name || '-'}</div>
          </div>
        )
      }
    },
    {
      key: 'description',
      title: 'Mô tả',
      dataIndex: 'description',
      width: 200,
      ellipsis: true
    },
    {
      key: 'price',
      title: 'Giá',
      dataIndex: 'price',
      width: 130,
      render: (value: unknown) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(value as number)}
        </span>
      )
    },
    {
      key: 'material',
      title: 'Chất liệu',
      dataIndex: 'material',
      width: 130,
      render: (value: unknown) => (
        <span className="text-gray-600">{(value as string) || '-'}</span>
      )
    },
    {
      key: 'rating',
      title: 'Đánh giá',
      width: 110,
      render: (_: unknown, record: ProductWithKey) => {
        const product = record as unknown as Product
        return (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium">{(product.ratingAvg ?? 0).toFixed(1)}</span>
            <span className="text-xs text-gray-500">({product.ratingCount ?? 0})</span>
          </div>
        )
      }
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 120,
      render: (value: unknown) => {
        const isActive = value as boolean
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? 'Hoạt động' : 'Ngừng'}
          </span>
        )
      }
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: ProductWithKey) => {
        const product = record as unknown as Product
        return (
          <Space size="small">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="primary"
                size="small"
                icon={<Edit className="w-4 h-4" />}
                onClick={() => onEdit(product)}
              />
            </Tooltip>
            <Tooltip title={product.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
              <Button
                size="small"
                icon={<Power className="w-4 h-4" />}
                style={{ color: product.isActive ? '#16a34a' : '#dc2626', borderColor: product.isActive ? '#16a34a' : '#dc2626' }}
                onClick={() => onToggleStatus(product._id, product.isActive)}
              />
            </Tooltip>
            <Tooltip title={product.isActive ? 'Vô hiệu hóa sản phẩm trước khi xóa' : 'Xóa'}>
              <Popconfirm
                title="Xác nhận xóa"
                description="Bạn có chắc chắn muốn xóa sản phẩm này?"
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={() => onDelete(product)}
                okButtonProps={{ danger: true }}
                disabled={product.isActive}
              >
                <Button
                  danger
                  size="small"
                  icon={<Trash2 className="w-4 h-4" />}
                  disabled={product.isActive}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        )
      }
    }
  ]

  return (
    <TableCommon<ProductWithKey>
      columns={columns}
      data={productsWithKeys}
      loading={isLoading}
      rowKey="key"
      pagination={{
        current: pagination?.currentPage || 1,
        pageSize: pagination?.pageSize || 10,
        total: pagination?.totalItems || 0,
        onChange: (page) => onPageChange(page)
      }}
      scroll={{ x: 'max-content' }}
      bordered
      size="small"
    />
  )
}

export default ProductList
