import { Controller } from 'react-hook-form'
import { useCallback } from 'react'
import { useManagerUserPage } from '@/hooks/useManagerUserPage'
import UserHeader from '@/components/user/UserHeader'
import UserFilterComponent from '@/components/user/UserFilter'
import UserListComponent from '@/components/user/UserList'
import UserDetailModal from '@/components/user/UserDetailModal'
import { ModalCommon, ButtonCommon, InputField, SelectField } from '@/components/common'
import { USER_ROLES } from '@/constants/constant'
import useAuth from '@/hooks/useAuth'
import type { User } from '@/features/user/userTypes'

const ManagerUserPage = () => {
  const { user: currentUser } = useAuth()
  const {
    users,
    filter,
    listLoading,
    actionLoading,
    filterPagination,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleClearFilter,
    handleUpdateStatus,
    isFormModalOpen,
    isEditMode,
    isDetailModalOpen,
    selectedUser,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleViewUser,
    handleCloseDetail,
    handleEditFromDetail,
    formMethods,
    onSubmit,
    roleOptions
  } = useManagerUserPage()

  const canEditUser = useCallback((user: User) => {
    return user.role === USER_ROLES.STAFF && user.branch === currentUser?.branch
  }, [currentUser?.branch])

  const { control, formState: { errors } } = formMethods

  return (
    <div className="p-2">
      <UserHeader title="Quản lý người dùng chi nhánh" onCreateUser={handleOpenCreate} />

      <UserFilterComponent
        searchValue={(filter.search as string) || ''}
        onSearchChange={handleSearchChange}
        filter={filter}
        onFilterChange={handleFilterChange}
        roleOptions={roleOptions}
        pagination={filterPagination}
        onPageChange={handlePageChange}
        onReset={handleClearFilter}
      />

      <UserListComponent
        users={users}
        isLoading={listLoading}
        pagination={filterPagination}
        onUpdateStatus={handleUpdateStatus}
        onPageChange={handlePageChange}
        onViewUser={handleViewUser}
        onEditUser={handleOpenEdit}
        canEditUser={canEditUser}
      />

      <ModalCommon
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        title={isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <ButtonCommon variant="outline" onClick={handleCloseForm} disabled={actionLoading}>
              Hủy
            </ButtonCommon>
            <ButtonCommon variant="primary" onClick={onSubmit} isLoading={actionLoading}>
              {isEditMode ? 'Cập nhật' : 'Tạo mới'}
            </ButtonCommon>
          </div>
        }
      >
        <div className="space-y-1">
          <Controller
            name="fullname"
            control={control}
            render={({ field }) => (
              <InputField
                label="Họ và tên"
                required
                placeholder="Nhập họ và tên"
                {...field}
                error={errors.fullname?.message}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <InputField
                label="Email"
                required
                type="email"
                placeholder="Nhập địa chỉ email"
                {...field}
                error={errors.email?.message}
                disabled={isEditMode}
              />
            )}
          />
          {!isEditMode && (
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <InputField
                  label="Mật khẩu"
                  required
                  type="password"
                  placeholder="Nhập mật khẩu"
                  {...field}
                  error={errors.password?.message}
                />
              )}
            />
          )}
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <InputField
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                {...field}
                error={errors.phone?.message}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Vai trò"
                required
                value={field.value}
                onChange={field.onChange}
                options={roleOptions}
                error={errors.role?.message}
                disabled={isEditMode}
              />
            )}
          />
        </div>
      </ModalCommon>

      <UserDetailModal
        isOpen={isDetailModalOpen}
        user={selectedUser}
        onClose={handleCloseDetail}
        onEdit={selectedUser && canEditUser(selectedUser) ? handleEditFromDetail : undefined}
      />
    </div>
  )
}

export default ManagerUserPage
