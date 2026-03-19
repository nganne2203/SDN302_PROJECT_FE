import { Button, Space, Popconfirm, Tooltip } from 'antd'
import { Edit, Trash2, Power } from 'lucide-react'
import { TableCommon, LoaderCommon } from '@/components/common'
import type { TableColumn } from '@/components/common/TableCommon'
import type { Category } from '@/features/category/categoryTypes'
import dayjs from 'dayjs'

/* eslint-disable no-unused-vars */
interface CategoryWithKey extends Record<string, unknown> {
  key: string
  _id: string
  name: string
  description?: string
  slug: string
  isActive: boolean
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

interface CategoryListProps {
  categories: Category[]
  isLoading: boolean
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  onUpdateStatus: (id: string, isActive: boolean) => void
  onPageChange: (page: number, pageSize: number) => void
}

const CategoryListComponent = ({
  categories,
  isLoading,
  pagination,
  onEdit,
  onDelete,
  onUpdateStatus,
  onPageChange
}: CategoryListProps) => {
  const categoryWithKeys: CategoryWithKey[] = categories.map(cat => ({
    ...cat,
    key: cat._id
  }))

  const currentPage = pagination?.page || 1
  const pageSize = pagination?.limit || 10
  const tableColumns: TableColumn<CategoryWithKey>[] = [
    {
      key: 'stt',
      title: 'STT',
      width: 70,
      align: 'center',
      fixed: 'left',
      render: (_: unknown, __: CategoryWithKey, index: number) => {
        const serialNumber = (currentPage - 1) * pageSize + index + 1
        return <span className="font-medium text-gray-700">#{serialNumber}</span>
      }
    },
    {
      key: 'name',
      title: 'Tên danh mục',
      dataIndex: 'name',
      width: 200,
      sortable: true,
      ellipsis: true,
      render: (value: unknown) => {
        const categoryName = typeof value === 'string' ? value : '-'
        return (
          <Tooltip title={categoryName}>
            <div className="max-w-[220px] overflow-hidden whitespace-nowrap text-ellipsis">
              {categoryName}
            </div>
          </Tooltip>
        )
      }
    },
    {
      key: 'description',
      title: 'Mô tả',
      dataIndex: 'description',
      width: 200,
      ellipsis: true,
      render: (value: unknown) => {
        const description = typeof value === 'string' ? value : ''
        return (
          <Tooltip title={description || '-'}>
            <div className="max-w-[320px] overflow-hidden whitespace-nowrap text-ellipsis text-gray-700">
              {description || '-'}
            </div>
          </Tooltip>
        )
      }
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 80,
      render: (value: unknown) => {
        const isActive = value as boolean
        return (
          <span className={isActive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
          </span>
        )
      }
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 100,
      sortable: true,
      render: (value: unknown) => {
        const dateStr = value as string
        return dayjs(dateStr).format('DD/MM/YYYY HH:mm')
      }
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: 100,
      fixed: 'right',
      render: (_: unknown, record: CategoryWithKey) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              size="small"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => onEdit(record as unknown as Category)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              size="small"
              icon={<Power className="w-4 h-4" />}
              style={{ color: record.isActive ? '#16a34a' : '#dc2626', borderColor: record.isActive ? '#16a34a' : '#dc2626' }}
              onClick={() => onUpdateStatus(record._id, !record.isActive)}
            />
          </Tooltip>
          {!record.isActive && (
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa danh mục này?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => onDelete(record._id as string)}
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa">
                <Button danger size="small" icon={<Trash2 className="w-4 h-4" />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  return (
    <>
      {isLoading ? (
        <LoaderCommon size="lg" tip="Đang tải danh mục..." />
      ) : (
        <TableCommon<CategoryWithKey>
          columns={tableColumns}
          data={categoryWithKeys}
          loading={isLoading}
          rowKey="key"
          pagination={{
            current: pagination?.page || 1,
            pageSize: pagination?.limit || 10,
            total: pagination?.total || 0,
            onChange: (page, pageSize) => onPageChange(page, pageSize)
          }}
          scroll={{ x: 'max-content' }}
          bordered
          size="small"
        />
      )}
    </>
  )
}

export default CategoryListComponent
