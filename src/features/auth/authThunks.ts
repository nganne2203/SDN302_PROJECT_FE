import { createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '@/apis/auth'
import { userApi } from '@/apis/user'
import { STORAGE_KEYS } from '@/constants/constant'
import { setStorage, removeStorage } from '@/utils/storage'
import type { 
  LoginPayload, 
  RegisterPayload, 
  AuthSuccessPayload,
  VerifyOTPPayload,
  ResendOTPPayload
} from './authTypes'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

export const loginThunk = createAsyncThunk<AuthSuccessPayload, LoginPayload>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials)
      const { accessToken, refreshToken } = response.data

      // Store tokens
      setStorage(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
      setStorage(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)

      // Fetch user profile (backend does not return user in /auth/login)
      const profileResponse = await userApi.getProfile()
      const user = profileResponse.data
      setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(user))

      return { accessToken, refreshToken, user }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      
      // Priority: errors array > message > default
      let errorMessage = 'Đăng nhập thất bại'
      if (errorData?.errors) {
        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors[0] || errorMessage
        } else {
          const firstError = Object.values(errorData.errors)[0]
          errorMessage = firstError?.[0] || errorMessage
        }
      } else if (errorData?.message) {
        errorMessage = errorData.message
      }
      
      return rejectWithValue(errorMessage)
    }
  }
)

export const registerThunk = createAsyncThunk<AuthSuccessPayload, RegisterPayload>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      // Transform the payload to match backend API
      const apiPayload = {
        fullname: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phoneNumber || '',
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.fullName),
        captchaToken: data.captchaToken,
      }
      
      const response = await authApi.register(apiPayload)
      
      // For now, since the API doesn't return tokens immediately (email verification flow),
      // we'll check if response has the expected structure
      if (response.data) {
        // If the API returns tokens, use them
        if ('accessToken' in response.data && 'refreshToken' in response.data && 'user' in response.data) {
          const { accessToken, refreshToken, user } = response.data as any
          setStorage(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
          setStorage(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
          setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(user))
          return { accessToken, refreshToken, user }
        }
        // If registration requires email verification, return success but no tokens yet
        return { accessToken: '', refreshToken: '', user: response.data as any }
      }
      
      throw new Error('Invalid response from server')
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      
      // Priority: errors array > message > default
      let errorMessage = 'Đăng ký thất bại'
      if (errorData?.errors) {
        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors[0] || errorMessage
        } else {
          const firstError = Object.values(errorData.errors)[0]
          errorMessage = firstError?.[0] || errorMessage
        }
      } else if (errorData?.message) {
        errorMessage = errorData.message
      }
      
      return rejectWithValue(errorMessage)
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
      // Always clear storage
      removeStorage(STORAGE_KEYS.ACCESS_TOKEN)
      removeStorage(STORAGE_KEYS.REFRESH_TOKEN)
      removeStorage(STORAGE_KEYS.USER_INFO)
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
      // Always clear storage
      removeStorage(STORAGE_KEYS.ACCESS_TOKEN)
      removeStorage(STORAGE_KEYS.REFRESH_TOKEN)
      removeStorage(STORAGE_KEYS.USER_INFO)
    }
  }
)

export const verifyOTPThunk = createAsyncThunk<void, VerifyOTPPayload>(
  'auth/verifyOTP',
  async (data, { rejectWithValue }) => {
    try {
      await authApi.verifyOTP(data)
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      
      let errorMessage = 'Xác thực OTP thất bại'
      if (errorData?.errors) {
        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors[0] || errorMessage
        } else {
          const firstError = Object.values(errorData.errors)[0]
          errorMessage = firstError?.[0] || errorMessage
        }
      } else if (errorData?.message) {
        errorMessage = errorData.message
      }
      
      return rejectWithValue(errorMessage)
    }
  }
)

export const resendOTPThunk = createAsyncThunk<void, ResendOTPPayload>(
  'auth/resendOTP',
  async (data, { rejectWithValue }) => {
    try {
      await authApi.resendOTP(data)
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const errorData = axiosError.response?.data
      
      let errorMessage = 'Gửi lại OTP thất bại'
      if (errorData?.errors) {
        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors[0] || errorMessage
        } else {
          const firstError = Object.values(errorData.errors)[0]
          errorMessage = firstError?.[0] || errorMessage
        }
      } else if (errorData?.message) {
        errorMessage = errorData.message
      }
      
      return rejectWithValue(errorMessage)
    }
  }
)
