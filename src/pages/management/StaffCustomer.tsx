import { Controller } from 'react-hook-form'
import { Input, Select } from 'antd'
import { useStaffCustomerPage } from '@/hooks/useStaffCustomerPage'
import UserHeader from '@/components/user/UserHeader'
import UserListComponent from '@/components/user/UserList'
import UserDetailModal from '@/components/user/UserDetailModal'
import { ModalCommon, ButtonCommon, InputField } from '@/components/common'

const StaffCustomerPage = () => {
  const {
    users,
    listLoading,
    actionLoading,
    filterPagination,
    searchValue,
    activeFilter,
    handleSearchChange,
    handleActiveFilterChange,
    handlePageChange,
    handleReset,
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
    onSubmit
  } = useStaffCustomerPage()

  const { control, formState: { errors } } = formMethods

  return (
    <div className="p-2">
      <UserHeader title="Quản lý khách hàng" onCreateUser={handleOpenCreate} />

      <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <Input.Search
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={searchValue}
            onSearch={handleSearchChange}
            onChange={e => handleSearchChange(e.target.value)}
            allowClear
            onClear={() => handleSearchChange('')}
          />
        </div>
        <Select
          style={{ minWidth: 140 }}
          placeholder="Trạng thái"
          value={activeFilter || undefined}
          onChange={handleActiveFilterChange}
          allowClear
          onClear={() => handleActiveFilterChange('')}
          options={[
            { value: 'true', label: 'Đang hoạt động' },
            { value: 'false', label: 'Đã vô hiệu hóa' }
          ]}
        />
        <ButtonCommon variant="outline" size="sm" onClick={handleReset}>
          Đặt lại
        </ButtonCommon>
      </div>

      <UserListComponent
        users={users}
        isLoading={listLoading}
        pagination={filterPagination}
        onPageChange={handlePageChange}
        onViewUser={handleViewUser}
        onEditUser={handleOpenEdit}
        hideStatusToggle
      />

      <ModalCommon
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        title={isEditMode ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng'}
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
        </div>
      </ModalCommon>

      <UserDetailModal
        isOpen={isDetailModalOpen}
        user={selectedUser}
        onClose={handleCloseDetail}
        onEdit={handleEditFromDetail}
      />
    </div>
  )
}

export default StaffCustomerPage
