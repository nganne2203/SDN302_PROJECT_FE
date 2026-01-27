import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import {
  loginThunk,
  registerThunk,
  logoutThunk,
  logoutAllThunk,
  verifyOTPThunk,
  resendOTPThunk,
  resetPasswordThunk,
  confirmResetPasswordThunk,
  setPasswordThunk,
  changePasswordThunk
} from '@/features/auth/authThunks'
import {
  clearCredentials,
  clearError,
  openOTPModal,
  closeOTPModal,
  setPendingEmail
} from '@/features/auth/authSlices'
import type {
  LoginPayload,
  RegisterPayload,
  VerifyOTPPayload,
  ResendOTPPayload,
  ResetPasswordPayload,
  ConfirmResetPasswordPayload,
  SetPasswordPayload,
  ChangePasswordPayload
} from '@/features/auth/authTypes'
import type { OTPType } from '@/types/api'
import { ROUTES, MANAGEMENT_ROLES, OTP_TYPES, ERROR_CODES } from '@/constants/constant'
export const useAuth = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const {
    isAuthenticated,
    user,
    isLoading,
    error,
    pendingEmail,
    isOTPModalOpen,
    otpType
  } = useAppSelector((state) => state.auth)

  const login = useCallback(
    async (credentials: LoginPayload): Promise<{ success: boolean; message?: string; needsVerification?: boolean }> => {
      const result = await dispatch(loginThunk(credentials))

      if (loginThunk.fulfilled.match(result)) {
        const userRole = result.payload.user.role

        if (MANAGEMENT_ROLES.includes(userRole)) {
          navigate(ROUTES.MANAGEMENT.DASHBOARD)
        } else {
          navigate(ROUTES.HOME)
        }

        return { success: true }
      }

      if (result.payload?.code === ERROR_CODES.EMAIL_NOT_VERIFIED) {
        return {
          success: false,
          message: result.payload?.message || 'Email chưa được xác thực',
          needsVerification: true
        }
      }

      return {
        success: false,
        message: result.payload?.message || 'Đăng nhập thất bại'
      }
    },
    [dispatch, navigate]
  )

  const register = useCallback(
    async (data: RegisterPayload): Promise<{ success: boolean; message?: string }> => {
      const result = await dispatch(registerThunk(data))

      if (registerThunk.fulfilled.match(result)) {
        return { success: true, message: result.payload.message }
      }

      return { success: false, message: result.payload as string }
    },
    [dispatch]
  )

  const verifyOTP = useCallback(
    async (data: VerifyOTPPayload): Promise<{ success: boolean; message?: string }> => {
      const result = await dispatch(verifyOTPThunk(data))

      if (verifyOTPThunk.fulfilled.match(result)) {
        if (data.type === OTP_TYPES.VERIFY_EMAIL && result.payload.user) {
          const userRole = result.payload.user.role

          if (MANAGEMENT_ROLES.includes(userRole)) {
            navigate(ROUTES.MANAGEMENT.DASHBOARD)
          } else {
            navigate(ROUTES.HOME)
          }
        }

        return { success: true, message: result.payload.message }
      }

      return { success: false, message: result.payload as string }
    },
    [dispatch, navigate]
  )

  const resendOTP = useCallback(
    async (data: ResendOTPPayload): Promise<{ success: boolean; message?: string }> => {
      const result = await dispatch(resendOTPThunk(data))

      if (resendOTPThunk.fulfilled.match(result)) {
        return { success: true, message: result.payload }
      }

      return { success: false, message: result.payload as string }
    },
    [dispatch]
  )

  const requestPasswordReset = useCallback(
    async (data: ResetPasswordPayload): Promise<{ success: boolean; message?: string }> => {
      const result = await dispatch(resetPasswordThunk(data))

      if (resetPasswordThunk.fulfilled.match(result)) {
        return { success: true, message: result.payload.message }
      }

      return { success: false, message: result.payload as string }
    },
    [dispatch]
  )

  const confirmPasswordReset = useCallback(
    async (data: ConfirmResetPasswordPayload): Promise<{ success: boolean; message?: string }> => {
      const result = await dispatch(confirmResetPasswordThunk(data))

      if (confirmResetPasswordThunk.fulfilled.match(result)) {
        navigate(ROUTES.LOGIN)
        return { success: true, message: result.payload }
      }

      return { success: false, message: result.payload as string }
    },
    [dispatch, navigate]
  )

  const setPassword = useCallback(
    async (data: SetPasswordPayload): Promise<{ success: boolean; message?: string }> => {
      const result = await dispatch(setPasswordThunk(data))

      if (setPasswordThunk.fulfilled.match(result)) {
        return { success: true, message: result.payload }
      }

      return { success: false, message: result.payload as string }
    },
    [dispatch]
  )

  const changePassword = useCallback(
    async (data: ChangePasswordPayload): Promise<{ success: boolean; message?: string }> => {
      const result = await dispatch(changePasswordThunk(data))

      if (changePasswordThunk.fulfilled.match(result)) {
        return { success: true, message: result.payload }
      }

      return { success: false, message: result.payload as string }
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    await dispatch(logoutThunk())
    dispatch(clearCredentials())
    navigate(ROUTES.HOME)
  }, [dispatch, navigate])

  const logoutAll = useCallback(async () => {
    await dispatch(logoutAllThunk())
    dispatch(clearCredentials())
    navigate(ROUTES.LOGIN)
  }, [dispatch, navigate])

  const clearAuthError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const showOTPModal = useCallback(
    (email: string, type: OTPType) => {
      dispatch(openOTPModal({ email, type }))
    },
    [dispatch]
  )

  const hideOTPModal = useCallback(() => {
    dispatch(closeOTPModal())
  }, [dispatch])

  const updatePendingEmail = useCallback(
    (email: string | null) => {
      dispatch(setPendingEmail(email))
    },
    [dispatch]
  )

  const isManagementUser = user ? MANAGEMENT_ROLES.includes(user.role) : false
  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const isStaff = user?.role === 'staff'
  const isCustomer = user?.role === 'customer'

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    pendingEmail,
    isOTPModalOpen,
    otpType,

    isManagementUser,
    isAdmin,
    isManager,
    isStaff,
    isCustomer,

    // Auth actions
    login,
    register,
    logout,
    logoutAll,

    // OTP actions
    verifyOTP,
    resendOTP,
    showOTPModal,
    hideOTPModal,

    // Password actions
    requestPasswordReset,
    confirmPasswordReset,
    setPassword,
    changePassword,

    // Utility actions
    clearAuthError,
    updatePendingEmail
  }
}

export default useAuth
