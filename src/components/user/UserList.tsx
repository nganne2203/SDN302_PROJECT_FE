import { Button, Space, Tooltip } from 'antd'
import { TableCommon, LoaderCommon } from '@/components/common'
import type { TableColumn } from '@/components/common/TableCommon'
import type { User } from '@/features/user/userTypes'
import dayjs from 'dayjs'
import { ROLE_LABELS } from '@/constants/constant'
import { Eye, Pencil, Power } from 'lucide-react'
import useAuth from '@/hooks/useAuth'

interface UserWithKey extends Record<string, unknown> {
  key: string
  _id: string
}

/* eslint-disable no-unused-vars */
interface UserListProps {
  users: User[]
  isLoading: boolean
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onUpdateStatus?: (id: string, isActive: boolean) => void
  onPageChange: (page: number, pageSize: number) => void
  onViewUser?: (user: User) => void
  onEditUser?: (user: User) => void
  canEditUser?: (user: User) => boolean
  hideStatusToggle?: boolean
}

const UserListComponent = ({
  users,
  isLoading,
  pagination,
  onUpdateStatus,
  onPageChange,
  onViewUser,
  onEditUser,
  canEditUser,
  hideStatusToggle = false
}: UserListProps) => {
  const { user: currentUser } = useAuth()
  const currentUserId = currentUser?.id ? String(currentUser.id) : null
  const currentUserRole = currentUser?.role
  const currentUserBranch = typeof currentUser?.branch === 'string' ? currentUser.branch : null

  const shouldHideSelfRow = currentUserRole ? ['admin', 'manager', 'staff'].includes(currentUserRole) : false
  const filteredUsers = shouldHideSelfRow && currentUserId
    ? users.filter((user) => user._id !== currentUserId)
    : users

  const usersWithKeys: UserWithKey[] = filteredUsers.map((user) => ({
    ...user,
    key: user._id
  }))

  const canToggleStatusForUser = (targetUser: User) => {
    if (hideStatusToggle || !onUpdateStatus) return false
    if (currentUserId && targetUser._id === currentUserId) return false

    if (currentUserRole === 'admin') return true

    if (currentUserRole === 'manager') {
      return targetUser.role === 'staff' && Boolean(currentUserBranch) && targetUser.branch === currentUserBranch
    }

    // Giữ hành vi cũ cho các role khác (staff/customer): chỉ thao tác với account staff.
    return targetUser.role === 'staff'
  }

  const tableColumns: TableColumn<UserWithKey>[] = [
    {
      key: 'fullname',
      title: 'Họ và tên',
      dataIndex: 'fullname',
      width: 220,
      sortable: true,
      ellipsis: true
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      width: 220,
      ellipsis: true
    },
    {
      key: 'role',
      title: 'Vai trò',
      dataIndex: 'role',
      width: 120,
      render: (value: unknown) => ROLE_LABELS[value as keyof typeof ROLE_LABELS] || '-'
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
      }
    },
    {
      key: 'provider',
      title: 'Phương thức',
      dataIndex: 'provider',
      width: 120,
      render: (value: unknown) => value === 'google' ? 'Google' : 'Local'
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 160,
      sortable: true,
      render: (value: unknown) => dayjs(value as string).format('DD/MM/YYYY HH:mm')
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: 200,
      fixed: 'right',
      render: (_: unknown, record: UserWithKey) => (
        <Space size="small">
          {onViewUser && (
            <Tooltip title="Xem chi tiết">
              <Button
                type="default"
                size="small"
                icon={<Eye className="w-4 h-4" />}
                onClick={() => onViewUser(record as unknown as User)}
              />
            </Tooltip>
          )}
          {onEditUser && (!canEditUser || canEditUser(record as unknown as User)) && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="primary"
                size="small"
                icon={<Pencil className="w-4 h-4" />}
                onClick={() => onEditUser(record as unknown as User)}
              />
            </Tooltip>
          )}
          {canToggleStatusForUser(record as unknown as User) && (
            <Tooltip title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
              <Button
                size="small"
                icon={<Power className="w-4 h-4" />}
                style={{ color: record.isActive ? '#16a34a' : '#dc2626', borderColor: record.isActive ? '#16a34a' : '#dc2626' }}
                onClick={() => onUpdateStatus(record._id, !record.isActive)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
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

export default UserListComponent
