import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useManagerUserManagement } from '@/hooks/useManagerUserManagement'
import { toast } from '@/utils/toast'
import { USER_ROLES, ROLE_LABELS } from '@/constants/constant'
import type { UserManageFilter, UserRole } from '@/types/api'
import type { User } from '@/features/user/userTypes'
import useAuth from '@/hooks/useAuth'
import { getChangedEmailField } from '@/utils/userUpdate'

// ─── Zod schemas ────────────────────────────────────────────────────
const MANAGER_ALLOWED_ROLES = [USER_ROLES.STAFF, USER_ROLES.CUSTOMER] as const

const managerUserSchema = z.object({
  fullname: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(100, 'Họ và tên quá dài'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().optional(),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ (10-11 số)')
    .or(z.literal(''))
    .optional(),
  role: z.enum([USER_ROLES.STAFF, USER_ROLES.CUSTOMER] as [string, ...string[]])
})

export type ManagerUserForm = z.infer<typeof managerUserSchema>

// ─── Hook ────────────────────────────────────────────────────────────
export const useManagerUserPage = () => {
  const { user: currentUser } = useAuth()
  const {
    users,
    pagination,
    filter,
    listLoading,
    actionLoading,
    error,
    fetchUsers,
    createUser,
    getUserById,
    updateUser,
    updateUserStatus,
    handleSetFilter,
    handleClearFilter,
    handleClearError
  } = useManagerUserManagement()

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const lastFetchParamsRef = useRef<string>('')

  // Clear shared filter state when page mounts
  useEffect(() => {
    handleClearFilter()
  }, [handleClearFilter])

  const formMethods = useForm<ManagerUserForm>({
    resolver: zodResolver(managerUserSchema),
    defaultValues: {
      fullname: '',
      email: '',
      password: '',
      phone: '',
      role: USER_ROLES.STAFF
    }
  })

  // Re-apply resolver when edit mode toggles
  useEffect(() => {
    // intentionally empty — resolver is picked at useForm init; reset handles default values
  }, [isEditMode])

  // ─── Data fetching ──────────────────────────────────────────────────
  useEffect(() => {
    const filterParams: UserManageFilter = {
      page: (filter.page as number) || 1,
      limit: (filter.limit as number) || 10,
      search: (filter.search as string) || undefined,
      role: (filter.role as UserRole) || undefined,
      isActive: typeof filter.isActive === 'boolean' ? filter.isActive : undefined,
      sortBy: (filter.sortBy as string) || 'createdAt',
      sortOrder: (filter.sortOrder as 'asc' | 'desc') || 'desc'
    }
    const paramsKey = JSON.stringify(filterParams)
    if (lastFetchParamsRef.current === paramsKey) return
    lastFetchParamsRef.current = paramsKey
    fetchUsers(filterParams)
  }, [filter, fetchUsers])

  useEffect(() => {
    if (error) handleClearError()
  }, [error, handleClearError])

  // ─── Filter handlers ────────────────────────────────────────────────
  const handleSearchChange = useCallback((value: string) => {
    handleSetFilter({ search: value, page: 1 })
  }, [handleSetFilter])

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    if (key === 'isActive') {
      const parsed = value === 'true' ? true : value === 'false' ? false : undefined
      handleSetFilter({ isActive: parsed, page: 1 })
      return
    }
    if (key === 'role') {
      handleSetFilter({ role: value === '' ? undefined : value, page: 1 })
      return
    }
    if (key === 'sort') {
      const s = value as { field?: string; order?: 'asc' | 'desc' | '' }
      handleSetFilter({ sortBy: s.field || 'createdAt', sortOrder: (s.order as 'asc' | 'desc') || 'desc', page: 1 })
      return
    }
    handleSetFilter({ [key]: value, page: 1 })
  }, [handleSetFilter])

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    handleSetFilter({ page, limit: pageSize })
  }, [handleSetFilter])

  // ─── Status toggle ──────────────────────────────────────────────────
  const handleUpdateStatus = useCallback(async (id: string, isActive: boolean) => {
    const result = await updateUserStatus(id, isActive)
    if (result.type.includes('fulfilled')) {
      toast.success('Cập nhật trạng thái thành công')
    } else if (result.payload) {
      toast.error(result.payload as string)
    }
  }, [updateUserStatus])

  // ─── Modal open/close ───────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setIsEditMode(false)
    setSelectedUser(null)
    formMethods.reset({ fullname: '', email: '', password: '', phone: '', role: USER_ROLES.STAFF })
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
          phone: fetched.phone || '',
          role: (fetched.role as string) || USER_ROLES.STAFF
        })
        setIsFormModalOpen(true)
      } else {
        toast.error('Không thể tải thông tin người dùng')
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi tải thông tin người dùng')
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
        const isStaffRole = data.role === USER_ROLES.STAFF
        const result = await updateUser(selectedUser._id, {
          fullname: data.fullname,
          ...getChangedEmailField(selectedUser, data.email),
          phone: data.phone || undefined,
          branch: isStaffRole ? currentUser?.branch?._id : undefined
        })
        if (result.type.includes('fulfilled')) {
          toast.success('Cập nhật người dùng thành công')
          handleCloseForm()
          fetchUsers(filter as UserManageFilter)
        } else if (result.payload) {
          toast.error(result.payload as string)
        }
      } else {
        const result = await createUser({
          fullname: data.fullname,
          email: data.email,
          password: data.password!,
          phone: data.phone || undefined,
          role: data.role as UserRole,
          branch: data.role === USER_ROLES.STAFF ? currentUser?.branch?._id : undefined
        })

        if (result.type.includes('fulfilled')) {
          toast.success('Tạo người dùng thành công')
          handleCloseForm()
          fetchUsers(filter as UserManageFilter)
        } else if (result.payload) {
          toast.error(result.payload as string)
        }
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi xử lý yêu cầu')
    }
  })

  // ─── Derived ────────────────────────────────────────────────────────
  const roleOptions = MANAGER_ALLOWED_ROLES.map(r => ({ value: r, label: ROLE_LABELS[r] }))

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
    // filter actions
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleClearFilter,
    handleUpdateStatus,
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
    onSubmit,
    roleOptions
  }
}
