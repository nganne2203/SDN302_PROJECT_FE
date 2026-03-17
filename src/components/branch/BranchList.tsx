import { Button, Popconfirm, Space, Tag, Tooltip } from 'antd'
import { Edit, Power, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import { LoaderCommon, TableCommon } from '@/components/common'
import type { TableColumn } from '@/components/common/TableCommon'
import type { Branch } from '@/features/branch/branchTypes'

/* eslint-disable no-unused-vars */
interface BranchWithKey extends Record<string, unknown> {
  key: string
  _id: string
}

interface BranchListProps {
  branches: Branch[]
  isLoading: boolean
  canManage?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onEdit: (branch: Branch) => void
  onUpdateStatus: (id: string, isActive: boolean) => void
  onDelete: (id: string) => void
  onPageChange: (page: number, pageSize: number) => void
}

const BranchListComponent = ({
  branches,
  isLoading,
  canManage = false,
  pagination,
  onEdit,
  onUpdateStatus,
  onDelete,
  onPageChange
}: BranchListProps) => {
  const rows: BranchWithKey[] = branches.map(b => ({
    ...b,
    key: b._id
  }))

  const columns: TableColumn<BranchWithKey>[] = [
    {
      key: 'name',
      title: 'Tên chi nhánh',
      dataIndex: 'name',
      width: 220,
      sortable: true,
      ellipsis: true
    },
    {
      key: 'address',
      title: 'Địa chỉ',
      dataIndex: 'address',
      width: 320,
      ellipsis: true
    },
    {
      key: 'manager',
      title: 'Quản lý',
      dataIndex: 'manager',
      width: 220,
      render: (value: unknown) => {
        const manager = value as { id: string; name: string } | null | undefined
        return manager?.name || '-'
      }
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 120,
      render: (value: unknown) => {
        const active = Boolean(value)
        return active ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Vô hiệu</Tag>
      }
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 160,
      render: (value: unknown) => dayjs(value as string).format('DD/MM/YYYY HH:mm')
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: 180,
      fixed: 'right',
      render: (_: unknown, record: BranchWithKey) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              size="small"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => onEdit(record as unknown as Branch)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              size="small"
              icon={<Power className="w-4 h-4" />}
              disabled={!canManage}
              style={{ color: record.isActive ? '#16a34a' : '#dc2626', borderColor: record.isActive ? '#16a34a' : '#dc2626' }}
              onClick={() => onUpdateStatus(record._id, !record.isActive)}
            />
          </Tooltip>
          {!record.isActive && (
            <Popconfirm
              title="Xác nhận xóa chi nhánh?"
              onConfirm={() => onDelete(record._id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa chi nhánh">
                <Button
                  size="small"
                  danger
                  icon={<Trash2 className="w-4 h-4" />}
                >
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  if (isLoading) {
    return <LoaderCommon size="lg" tip="Đang tải danh sách chi nhánh..." />
  }

  return (
    <TableCommon<BranchWithKey>
      columns={columns}
      data={rows}
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
  )
}

export default BranchListComponent

