import { Button, Space } from 'antd'
import { TableCommon, LoaderCommon } from '@/components/common'
import type { TableColumn } from '@/components/common/TableCommon'
import type { User } from '@/features/user/userTypes'
import dayjs from 'dayjs'
import { ROLE_LABELS } from '@/constants/constant'

interface UserWithKey extends Record<string, unknown> {
  key: string
  _id: string
}

interface UserListProps {
  users: User[]
  isLoading: boolean
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onUpdateStatus: (id: string, isActive: boolean) => void
  onPageChange: (page: number, pageSize: number) => void
}

const UserListComponent = ({
  users,
  isLoading,
  pagination,
  onUpdateStatus,
  onPageChange,
}: UserListProps) => {
  const usersWithKeys: UserWithKey[] = users.map(user => ({
    ...user,
    key: user._id,
  }))

  const tableColumns: TableColumn<UserWithKey>[] = [
    {
      key: 'fullname',
      title: 'Họ và tên',
      dataIndex: 'fullname',
      width: 220,
      sortable: true,
      ellipsis: true,
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      width: 220,
      ellipsis: true,
    },
    {
      key: 'role',
      title: 'Vai trò',
      dataIndex: 'role',
      width: 120,
      render: (value: unknown) => ROLE_LABELS[value as keyof typeof ROLE_LABELS] || '-',
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 120,
      render: (value: unknown) => {
        const isActive = Boolean(value)
        return (
          <span className={isActive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
          </span>
        )
      },
    },
    {
      key: 'provider',
      title: 'Phương thức',
      dataIndex: 'provider',
      width: 120,
      render: (value: unknown) => value === 'google' ? 'Google' : 'Local',
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 160,
      sortable: true,
      render: (value: unknown) => dayjs(value as string).format('DD/MM/YYYY HH:mm'),
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: 140,
      fixed: 'right',
      render: (_: unknown, record: UserWithKey) => (
        <Space>
          <Button
            type={record.isActive ? 'default' : 'primary'}
            size="small"
            onClick={() => onUpdateStatus(record._id, !record.isActive)}
          >
            {record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      {isLoading ? (
        <LoaderCommon size="lg" tip="Đang tải danh sách người dùng..." />
      ) : (
        <TableCommon<UserWithKey>
          columns={tableColumns}
          data={usersWithKeys}
          loading={isLoading}
          rowKey="key"
          pagination={{
            current: pagination?.page || 1,
            pageSize: pagination?.limit || 10,
            total: pagination?.total || 0,
            onChange: (page, pageSize) => onPageChange(page, pageSize),
          }}
          scroll={{ x: 'max-content' }}
          bordered
          size="small"
        />
      )}
    </>
  )
}

export default UserListComponent
