import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import { loginThunk, registerThunk, logoutThunk } from '@/features/auth/authThunks'
import { clearCredentials, clearError } from '@/features/auth/authSlices'
import type { LoginPayload, RegisterPayload } from '@/features/auth/authTypes'
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
        navigate(ROUTES.HOME)
        return true
      }
      return false
    },
    [dispatch, navigate]
  )

  const logout = useCallback(async () => {
    await dispatch(logoutThunk())
    dispatch(clearCredentials())
    navigate(ROUTES.LOGIN)
  }, [dispatch, navigate])

  const clearAuthError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearAuthError,
  }
}

export default useAuth
