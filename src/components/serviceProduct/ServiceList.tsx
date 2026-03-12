import { Popconfirm, Space, Button, Tooltip } from 'antd'
import { TableCommon } from '@/components/common'
import type { TableColumn } from '@/components/common/TableCommon'
import { Edit, Trash2, Power } from 'lucide-react'
import { getProductImageUrl } from '@/utils/imageHelper'
import dayjs from 'dayjs'
import type { ServiceProduct } from '@/features/serviceProduct/serviceProductTypes'

interface ServiceProductWithKey extends ServiceProduct {
  [key: string]: unknown
}

/* eslint-disable no-unused-vars */
const ServiceProductList = ({
  data,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onStatusChange,
  canManage
}: {
  data: ServiceProduct[]
  loading: boolean
  pagination: { page: number; limit: number; total: number }
  onPageChange: (page: number, size: number) => void
  onEdit: (item: ServiceProduct) => void
  onDelete: (item: ServiceProduct) => void
  onStatusChange: (id: string, status: boolean) => void
  canManage?: boolean
}) => {
  const dataWithKeys: ServiceProductWithKey[] = data.map((item) => ({
    ...item,
    key: item._id
  }))

  const columns: TableColumn<ServiceProductWithKey>[] = [
    {
      key: 'product',
      title: 'Sản phẩm áp dụng',
      width: 250,
      render: (_, record) => (
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0'>
            {record.product.images ? (
              (() => {
                const url = getProductImageUrl(record.product.images);
                return (
                  <img
                    src={url}
                    alt={record.product.name}
                    className='w-full h-full object-cover'
                  />
                );
              })()
            ) : (
              <div className='w-full h-full flex items-center justify-center text-xs text-gray-400'>No img</div>
            )}
          </div>
          <div className='flex flex-col'>
            <span className='font-medium text-gray-900 line-clamp-1'>{record.product.name}</span>
            <span className='text-xs text-gray-500'>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.product.price)}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'name',
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      width: 200,
      sortable: true,
      render: (value, record) => (
        <div className='flex flex-col'>
          <span className='font-medium text-gray-800'>{value as string}</span>
          <span className='text-xs text-gray-500 line-clamp-1'>{record.description}</span>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Loại',
      dataIndex: 'type',
      width: 120,
      render: (value) => {
        const colors: Record<string, string> = {
          printing: 'bg-blue-50 text-blue-700 border-blue-200',
          warranty: 'bg-purple-50 text-purple-700 border-purple-200',
          other: 'bg-gray-50 text-gray-700 border-gray-200'
        }
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[value as string] || colors.other}`}>
            {value === 'printing' ? 'In ấn' : value === 'warranty' ? 'Bảo hành' : 'Khác'}
          </span>
        )
      }
    },
    {
      key: 'price',
      title: 'Giá dịch vụ',
      dataIndex: 'price',
      width: 150,
      sortable: true,
      render: (value) => (
        <span className='font-semibold text-gray-900'>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value as number)}
        </span>
      )
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 140,
      render: (value) => (
        <div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              value
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${value ? 'bg-green-600' : 'bg-red-600'}`} />
            {value ? 'Hoạt động' : 'Vô hiệu hóa'}
          </span>
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 150,
      sortable: true,
      render: (value) => <span className='text-gray-500'>{dayjs(value as string).format('DD/MM/YYYY')}</span>
    },
  ]

  if (canManage) {
    columns.push({
      key: 'actions',
      title: 'Hành động',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              size="small"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              size="small"
              icon={<Power className="w-4 h-4" />}
              style={{ color: record.isActive ? '#16a34a' : '#dc2626', borderColor: record.isActive ? '#16a34a' : '#dc2626' }}
              onClick={() => onStatusChange(record._id, !record.isActive)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa dịch vụ"
            description={`Bạn có chắc muốn xóa dịch vụ "${record.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(record)}
          >
            <Tooltip title="Xóa">
              <Button danger size="small" icon={<Trash2 className="w-4 h-4" />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    })
  }

  return (
    <TableCommon<ServiceProductWithKey>
      columns={columns}
      data={dataWithKeys}
      loading={loading}
      rowKey='key'
      pagination={{
        current: pagination.page,
        pageSize: pagination.limit,
        total: pagination.total,
        onChange: onPageChange
      }}
      scroll={{ x: 'max-content' }}
      bordered
      size='small'
    />
  )
}

export default ServiceProductList

