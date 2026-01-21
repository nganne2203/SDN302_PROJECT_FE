import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import { 
  loginThunk, 
  registerThunk, 
  logoutThunk,
  logoutAllThunk,
  verifyOTPThunk,
  resendOTPThunk
} from '@/features/auth/authThunks'
import { clearCredentials, clearError } from '@/features/auth/authSlices'
import type { 
  LoginPayload, 
  RegisterPayload,
  VerifyOTPPayload,
  ResendOTPPayload
} from '@/features/auth/authTypes'
import { ROUTES } from '@/constants/constant'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, user, isLoading, error } = useAppSelector((state) => state.auth)

  const login = useCallback(
    async (credentials: LoginPayload) => {
      const result = await dispatch(loginThunk(credentials))
      if (loginThunk.fulfilled.match(result)) {
        navigate(ROUTES.HOME)
        return true
      }
      return false
    },
    [dispatch, navigate]
  )

  const register = useCallback(
    async (data: RegisterPayload) => {
      const result = await dispatch(registerThunk(data))
      if (registerThunk.fulfilled.match(result)) {
        // Don't auto-navigate, let the Register page handle OTP flow
        return true
      }
      return false
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    await dispatch(logoutThunk())
    dispatch(clearCredentials())
    navigate(ROUTES.LOGIN)
  }, [dispatch, navigate])

  const logoutAll = useCallback(async () => {
    await dispatch(logoutAllThunk())
    dispatch(clearCredentials())
    navigate(ROUTES.LOGIN)
  }, [dispatch, navigate])

  const clearAuthError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const verifyOTP = useCallback(
    async (data: VerifyOTPPayload) => {
      const result = await dispatch(verifyOTPThunk(data))
      if (verifyOTPThunk.fulfilled.match(result)) {
        return true
      }
      return false
    },
    [dispatch]
  )

  const resendOTP = useCallback(
    async (data: ResendOTPPayload) => {
      const result = await dispatch(resendOTPThunk(data))
      if (resendOTPThunk.fulfilled.match(result)) {
        return true
      }
      return false
    },
    [dispatch]
  )

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    logoutAll,
    clearAuthError,
    verifyOTP,
    resendOTP,
  }
}

export default useAuth
