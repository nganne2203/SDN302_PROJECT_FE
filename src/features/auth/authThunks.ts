import { createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '@/apis/auth'
import { userApi } from '@/apis/user'
import { STORAGE_KEYS, OTP_TYPES } from '@/constants/constant'
import { setStorage, removeStorage } from '@/utils/storage'
import type { 
  LoginPayload, 
  RegisterPayload,
  RegisterSuccessPayload,
  AuthSuccessPayload,
  VerifyOTPPayload,
  VerifyOTPSuccessPayload,
  ResendOTPPayload,
  ResetPasswordPayload,
  ResetPasswordSuccessPayload,
  ConfirmResetPasswordPayload,
  SetPasswordPayload,
  ChangePasswordPayload,
} from './authTypes'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
  const axiosError = error as AxiosError<ApiError>
  const errorData = axiosError.response?.data
  
  if (errorData?.message) {
    return errorData.message
  }
  
  if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
    return errorData.errors[0]
  }
  
  return defaultMessage
}

const extractErrorCode = (error: unknown): string | null => {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.code || null
}

export const loginThunk = createAsyncThunk<
  AuthSuccessPayload, 
  LoginPayload,
  { rejectValue: { message: string; code?: string } }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials)
      const { accessToken, refreshToken } = response.data

      setStorage(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
      setStorage(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)

      const profileResponse = await userApi.getProfile()
      const user = profileResponse.data
      setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(user))

      return { accessToken, refreshToken, user }
    } catch (error) {
      const message = extractErrorMessage(error, 'Đăng nhập thất bại')
      const code = extractErrorCode(error) || undefined
      return rejectWithValue({ message, code })
    }
  }
)

export const registerThunk = createAsyncThunk<
  RegisterSuccessPayload,
  RegisterPayload,
  { rejectValue: string }
>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const apiPayload = {
        fullname: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phoneNumber || '',
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.fullName),
        captchaToken: data.captchaToken,
      }
      
      const response = await authApi.register(apiPayload)
      setStorage(STORAGE_KEYS.PENDING_EMAIL, data.email)
      
      return {
        email: data.email,
        message: response.message,
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Đăng ký thất bại'))
    }
  }
)

export const verifyOTPThunk = createAsyncThunk<
  VerifyOTPSuccessPayload,
  VerifyOTPPayload,
  { rejectValue: string }
>(
  'auth/verifyOTP',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOTP(data)
      
      if (data.type === OTP_TYPES.VERIFY_EMAIL && response.data) {
        const { accessToken, refreshToken } = response.data
        
        if (accessToken && refreshToken) {
          setStorage(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
          setStorage(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
          
          const profileResponse = await userApi.getProfile()
          const user = profileResponse.data 
          setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(user))
          
          removeStorage(STORAGE_KEYS.PENDING_EMAIL)
          
          return {
            message: response.message,
            accessToken,
            refreshToken,
            user,
          }
        }
      }
      
      return {
        message: response.message,
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Xác thực OTP thất bại'))
    }
  }
)

export const resendOTPThunk = createAsyncThunk<
  string,
  ResendOTPPayload,
  { rejectValue: string }
>(
  'auth/resendOTP',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.resendOTP(data)
      return response.message
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Gửi lại mã OTP thất bại'))
    }
  }
)

// ========================
// Reset Password Thunk (Step 1: Request OTP)
// ========================

export const resetPasswordThunk = createAsyncThunk<
  ResetPasswordSuccessPayload,
  ResetPasswordPayload,
  { rejectValue: string }
>(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(data)
      
      setStorage(STORAGE_KEYS.PENDING_EMAIL, data.email)
      
      return {
        email: data.email,
        message: response.message,
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Yêu cầu đặt lại mật khẩu thất bại'))
    }
  }
)

export const confirmResetPasswordThunk = createAsyncThunk<
  string,
  ConfirmResetPasswordPayload,
  { rejectValue: string }
>(
  'auth/confirmResetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.confirmResetPassword(data)
      
      removeStorage(STORAGE_KEYS.PENDING_EMAIL)
      
      return response.message
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Đặt lại mật khẩu thất bại'))
    }
  }
)

export const setPasswordThunk = createAsyncThunk<
  string,
  SetPasswordPayload,
  { rejectValue: string }
>(
  'auth/setPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.setPassword(data)
      setStorage(STORAGE_KEYS.HAS_PASSWORD, 'true')
      return response.message
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Đặt mật khẩu thất bại'))
    }
  }
)

export const changePasswordThunk = createAsyncThunk<
  string,
  ChangePasswordPayload,
  { rejectValue: string }
>(
  'auth/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(data)
      return response.message
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Đổi mật khẩu thất bại'))
    }
  }
)

export const logoutThunk = createAsyncThunk<void, void>(
  'auth/logout',
  async () => {
    try {
      await authApi.logout()
    } catch {
      // Continue with logout even if API fails
    } finally {
      removeStorage(STORAGE_KEYS.ACCESS_TOKEN)
      removeStorage(STORAGE_KEYS.REFRESH_TOKEN)
      removeStorage(STORAGE_KEYS.USER_INFO)
      removeStorage(STORAGE_KEYS.HAS_PASSWORD)
      removeStorage(STORAGE_KEYS.PENDING_EMAIL)
    }
  }
)

export const logoutAllThunk = createAsyncThunk<void, void>(
  'auth/logoutAll',
  async () => {
    try {
      await authApi.logoutAll()
    } catch {
      // Continue with logout even if API fails
    } finally {
      removeStorage(STORAGE_KEYS.ACCESS_TOKEN)
      removeStorage(STORAGE_KEYS.REFRESH_TOKEN)
      removeStorage(STORAGE_KEYS.USER_INFO)
      removeStorage(STORAGE_KEYS.HAS_PASSWORD)
      removeStorage(STORAGE_KEYS.PENDING_EMAIL)
    }
  }
)
