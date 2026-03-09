import { FilterCommon } from '@/components/common'
import type { FilterField } from '@/components/common/FilterCommon'
import type { FilterOption } from '@/types/filter'
import type { UserFilter } from '@/features/user/userTypes'
import { ROLE_LABELS, USER_ROLES } from '@/constants/constant'

/* eslint-disable no-unused-vars */
interface UserFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filter: UserFilter
  onFilterChange: (key: string, value: unknown) => void
  roleOptions?: Array<{ label: string; value: string }>
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onPageChange: (page: number, pageSize: number) => void
  onReset: () => void
}

const UserFilterComponent = ({
  searchValue,
  onSearchChange,
  filter,
  onFilterChange,
  roleOptions,
  onReset
}: UserFilterProps) => {
  const defaultRoleOptions = [
    { label: ROLE_LABELS[USER_ROLES.ADMIN], value: USER_ROLES.ADMIN },
    { label: ROLE_LABELS[USER_ROLES.MANAGER], value: USER_ROLES.MANAGER },
    { label: ROLE_LABELS[USER_ROLES.STAFF], value: USER_ROLES.STAFF },
    { label: ROLE_LABELS[USER_ROLES.CUSTOMER], value: USER_ROLES.CUSTOMER }
  ]

  const resolvedRoleOptions = roleOptions && roleOptions.length > 0 ? roleOptions : defaultRoleOptions

  const filterFields: FilterField[] = [
    {
      key: 'role',
      label: 'Vai trò',
      type: 'select',
      options: [
        { label: 'Tất cả', value: '' },
        ...resolvedRoleOptions
      ]
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'Tất cả', value: '' },
        { label: 'Hoạt động', value: 'true' },
        { label: 'Vô hiệu hóa', value: 'false' }
      ]
    }
  ]

  const sortOptions: FilterOption[] = [
    { label: 'Ngày tạo', value: 'createdAt' },
    { label: 'Tên', value: 'fullname' }
  ]

  const filterValues = {
    ...filter,
    isActive: typeof filter.isActive === 'boolean' ? String(filter.isActive) : filter.isActive
  }

  return (
    <FilterCommon
      searchPlaceholder="Tìm kiếm tên, email hoặc số điện thoại"
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      showSearch
      filters={filterFields}
      filterValues={filterValues as Record<string, unknown>}
      onFilterChange={onFilterChange}
      sortOptions={sortOptions}
      sortBy={(filter.sortBy as string) || 'createdAt'}
      sortOrder={(filter.sortOrder as 'asc' | 'desc') || 'desc'}
      onSortChange={(field, order) => onFilterChange('sort', { field, order })}
      showSort
      onReset={onReset}
      showReset
      compact
    />
  )
}

export default UserFilterComponent
