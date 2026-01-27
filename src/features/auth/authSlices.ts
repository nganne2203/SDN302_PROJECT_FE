import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, AuthSuccessPayload, RegisterSuccessPayload, VerifyOTPSuccessPayload, ResetPasswordSuccessPayload } from './authTypes'
import type { OTPType } from '@/types/api'
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
  changePasswordThunk,
  refreshTokenThunk
} from './authThunks'
import { OTP_TYPES } from '@/constants/constant'

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  pendingEmail: null,
  isOTPModalOpen: false,
  otpType: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthSuccessPayload>) => {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.error = null
      state.pendingEmail = null
      state.isOTPModalOpen = false
      state.otpType = null
    },
    clearCredentials: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.error = null
      state.pendingEmail = null
      state.isOTPModalOpen = false
      state.otpType = null
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearError: (state) => {
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    openOTPModal: (state, action: PayloadAction<{ email: string; type: OTPType }>) => {
      state.isOTPModalOpen = true
      state.pendingEmail = action.payload.email
      state.otpType = action.payload.type
    },
    closeOTPModal: (state) => {
      state.isOTPModalOpen = false
      state.otpType = null
    },
    setPendingEmail: (state, action: PayloadAction<string | null>) => {
      state.pendingEmail = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.pendingEmail = null
        state.isOTPModalOpen = false
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || 'Đăng nhập thất bại'
        if (action.payload?.code === 'EMAIL_NOT_VERIFIED') {
          state.pendingEmail = action.meta.arg.email
        }
      })

    builder
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerThunk.fulfilled, (state, action: PayloadAction<RegisterSuccessPayload>) => {
        state.isLoading = false
        state.pendingEmail = action.payload.email
        state.isOTPModalOpen = true
        state.otpType = OTP_TYPES.VERIFY_EMAIL as OTPType
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(verifyOTPThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOTPThunk.fulfilled, (state, action: PayloadAction<VerifyOTPSuccessPayload>) => {
        state.isLoading = false
        if (action.payload.accessToken && action.payload.refreshToken && action.payload.user) {
          state.isAuthenticated = true
          state.accessToken = action.payload.accessToken
          state.refreshToken = action.payload.refreshToken
          state.user = action.payload.user
          state.pendingEmail = null
        }
        state.isOTPModalOpen = false
        state.otpType = null
      })
      .addCase(verifyOTPThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(resendOTPThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resendOTPThunk.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(resendOTPThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(resetPasswordThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPasswordThunk.fulfilled, (state, action: PayloadAction<ResetPasswordSuccessPayload>) => {
        state.isLoading = false
        state.pendingEmail = action.payload.email
        state.isOTPModalOpen = true
        state.otpType = OTP_TYPES.RESET_PASSWORD as OTPType
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(confirmResetPasswordThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(confirmResetPasswordThunk.fulfilled, (state) => {
        state.isLoading = false
        state.pendingEmail = null
      })
      .addCase(confirmResetPasswordThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(setPasswordThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(setPasswordThunk.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(setPasswordThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(changePasswordThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(refreshTokenThunk.pending, (state) => {
        state.error = null
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.user = action.payload.user
      })
      .addCase(refreshTokenThunk.rejected, (state, action) => {
        state.isAuthenticated = false
        state.accessToken = null
        state.refreshToken = null
        state.user = null
        state.error = action.payload as string
      })

    builder
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.pendingEmail = null
        state.isOTPModalOpen = false
        state.otpType = null
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.pendingEmail = null
        state.isOTPModalOpen = false
        state.otpType = null
      })

    builder
      .addCase(logoutAllThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutAllThunk.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.pendingEmail = null
        state.isOTPModalOpen = false
        state.otpType = null
      })
      .addCase(logoutAllThunk.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.pendingEmail = null
        state.isOTPModalOpen = false
        state.otpType = null
      })
  }
})

export const {
  setCredentials,
  clearCredentials,
  setError,
  clearError,
  setLoading,
  openOTPModal,
  closeOTPModal,
  setPendingEmail
} = authSlice.actions

export default authSlice.reducer
