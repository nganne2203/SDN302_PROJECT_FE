import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStaffCustomerManagement } from '@/hooks/useStaffCustomerManagement'
import { toast } from '@/utils/toast'
import { USER_ROLES } from '@/constants/constant'
import type { UserManageFilter, UserRole } from '@/types/api'
import type { User } from '@/features/user/userTypes'

// ─── Zod schemas ────────────────────────────────────────────────────
const phoneValidation = z
  .string()
  .regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ (10-11 số)')
  .or(z.literal(''))
  .optional()

const customerSchema = z.object({
  fullname: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(100, 'Họ và tên quá dài'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().optional(),
  phone: phoneValidation
})

export type CustomerForm = z.infer<typeof customerSchema>

// ─── Hook ────────────────────────────────────────────────────────────
export const useStaffCustomerPage = () => {
  const {
    users,
    pagination,
    filter,
    listLoading,
    actionLoading,
    error,
    fetchCustomers,
    createUser,
    getUserById,
    updateUser,
    handleSetFilter,
    handleClearFilter,
    handleClearError
  } = useStaffCustomerManagement()

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchValue, setSearchValue] = useState((filter.search as string) || '')
  const [activeFilter, setActiveFilter] = useState<string>('')
  const lastFetchParamsRef = useRef<string>('')

  const formMethods = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: { fullname: '', email: '', password: '', phone: '' }
  })

  // ─── Data fetching ──────────────────────────────────────────────────
  useEffect(() => {
    const filterParams: UserManageFilter = {
      page: (filter.page as number) || 1,
      limit: (filter.limit as number) || 10,
      search: (filter.search as string) || undefined,
      isActive: typeof filter.isActive === 'boolean' ? filter.isActive : undefined,
      sortBy: (filter.sortBy as string) || 'createdAt',
      sortOrder: (filter.sortOrder as 'asc' | 'desc') || 'desc'
    }
    const paramsKey = JSON.stringify(filterParams)
    if (lastFetchParamsRef.current === paramsKey) return
    lastFetchParamsRef.current = paramsKey
    fetchCustomers(filterParams)
  }, [filter, fetchCustomers])

  useEffect(() => {
    if (error) handleClearError()
  }, [error, handleClearError])

  // ─── Filter handlers ────────────────────────────────────────────────
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value)
    handleSetFilter({ search: value, page: 1 })
  }, [handleSetFilter])

  const handleActiveFilterChange = useCallback((value: string) => {
    setActiveFilter(value)
    handleSetFilter({
      isActive: value === 'true' ? true : value === 'false' ? false : undefined,
      page: 1
    })
  }, [handleSetFilter])

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    if (key === 'isActive') {
      const strVal = typeof value === 'string' ? value : ''
      setActiveFilter(strVal)
      handleSetFilter({
        isActive: strVal === 'true' ? true : strVal === 'false' ? false : undefined,
        page: 1
      })
      return
    }
    if (key === 'sort') {
      const s = value as { field?: string; order?: 'asc' | 'desc' | '' }
      handleSetFilter({
        sortBy: s.field || 'createdAt',
        sortOrder: (s.order as 'asc' | 'desc') || 'desc',
        page: 1
      })
      return
    }
    handleSetFilter({ [key]: value, page: 1 })
  }, [handleSetFilter])

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    handleSetFilter({ page, limit: pageSize })
  }, [handleSetFilter])

  const handleReset = useCallback(() => {
    setSearchValue('')
    setActiveFilter('')
    handleClearFilter()
  }, [handleClearFilter])

  // ─── Modal open/close ───────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setIsEditMode(false)
    setSelectedUser(null)
    formMethods.reset({ fullname: '', email: '', password: '', phone: '' })
    setIsFormModalOpen(true)
  }, [formMethods])

  const handleOpenEdit = useCallback(async (user: User) => {
    try {
      const result = await getUserById(user._id)
      if (result.type.includes('fulfilled')) {
        const fetched = result.payload as User
        setIsEditMode(true)
        setSelectedUser(fetched)
        formMethods.reset({
          fullname: fetched.fullname || '',
          email: fetched.email || '',
          password: '',
          phone: fetched.phone || ''
        })
        setIsFormModalOpen(true)
      } else {
        toast.error('Không thể tải thông tin khách hàng')
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi tải thông tin khách hàng')
    }
  }, [getUserById, formMethods])

  const handleCloseForm = useCallback(() => {
    setIsFormModalOpen(false)
    setIsEditMode(false)
    setSelectedUser(null)
    formMethods.reset()
  }, [formMethods])

  const handleViewUser = useCallback((user: User) => {
    setSelectedUser(user)
    setIsDetailModalOpen(true)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setIsDetailModalOpen(false)
    setSelectedUser(null)
  }, [])

  const handleEditFromDetail = useCallback((user: User) => {
    setIsDetailModalOpen(false)
    handleOpenEdit(user)
  }, [handleOpenEdit])

  // ─── Form submit ────────────────────────────────────────────────────
  const onSubmit = formMethods.handleSubmit(async (data) => {
    // Validate password on create
    if (!isEditMode && (!data.password || data.password.length < 6)) {
      formMethods.setError('password', { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
      return
    }
    try {
      if (isEditMode && selectedUser) {
        const result = await updateUser(selectedUser._id, {
          fullname: data.fullname,
          email: data.email,
          phone: data.phone || undefined
        })
        if (result.type.includes('fulfilled')) {
          toast.success('Cập nhật khách hàng thành công')
          handleCloseForm()
          fetchCustomers(filter as UserManageFilter)
        } else if (result.payload) {
          toast.error(result.payload as string)
        }
      } else {
        const result = await createUser({
          fullname: data.fullname,
          email: data.email,
          password: data.password!,
          phone: data.phone || undefined,
          role: USER_ROLES.CUSTOMER as UserRole
        })
        if (result.type.includes('fulfilled')) {
          toast.success('Tạo khách hàng thành công')
          handleCloseForm()
          fetchCustomers(filter as UserManageFilter)
        } else if (result.payload) {
          toast.error(result.payload as string)
        }
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi xử lý yêu cầu')
    }
  })

  // ─── Derived ────────────────────────────────────────────────────────
  const filterPagination = {
    page: (filter.page as number) || 1,
    limit: (filter.limit as number) || 10,
    total: pagination?.totalItems || 0
  }

  return {
    // list
    users,
    filter,
    listLoading,
    actionLoading,
    filterPagination,
    searchValue,
    activeFilter,
    // filter actions
    handleSearchChange,
    handleActiveFilterChange,
    handleFilterChange,
    handlePageChange,
    handleReset,
    // modal state
    isFormModalOpen,
    isEditMode,
    isDetailModalOpen,
    selectedUser,
    // modal actions
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleViewUser,
    handleCloseDetail,
    handleEditFromDetail,
    // form
    formMethods,
    onSubmit
  }
}
