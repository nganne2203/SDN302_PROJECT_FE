import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "@/apis/auth";
import { STORAGE_KEYS } from "@/constants/constant";
import { setStorage, removeStorage } from "@/utils/storage";
import type {
  LoginPayload,
  RegisterPayload,
  AuthSuccessPayload,
  VerifyOTPPayLoad,
} from "./authTypes";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types/api";
import type { ChangePasswordPayload } from "../user/userTypes";

export const loginThunk = createAsyncThunk<AuthSuccessPayload, LoginPayload>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens
      setStorage(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      setStorage(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(user));

      return { accessToken, refreshToken, user };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Đăng nhập thất bại",
      );
    }
  },
);

export const registerThunk = createAsyncThunk<
  AuthSuccessPayload,
  RegisterPayload
>("auth/register", async (data, { rejectWithValue }) => {
  try {
    const response = await authApi.register(data);
    const { accessToken, refreshToken, user } = response.data;

    // Store tokens
    setStorage(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    setStorage(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(user));

    return { accessToken, refreshToken, user };
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Đăng ký thất bại",
    );
  }
});

export const changePasswordThunk = createAsyncThunk<
  void,
  ChangePasswordPayload
>("user/changePassword", async (data, { rejectWithValue }) => {
  try {
    await authApi.changePassword(data);
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Không thể đổi mật khẩu",
    );
  }
});

export const resetPasswordThunk = createAsyncThunk<void, string>(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      await authApi.resetPassword(data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Không thể tìm lại mật khẩu",
      );
    }
  },
);

export const verifyOTPThunk = createAsyncThunk<void, VerifyOTPPayLoad>(
  "auth/verifyOTP",
  async (data, { rejectWithValue }) => {
    try {
      await authApi.verifyOTP(data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Xác nhận OTP thất bại",
      );
    }
  },
);

export const confirmResetPasswordThunk = createAsyncThunk<void, LoginPayload>(
  "auth/confirmResetPassword",
  async (data, { rejectWithValue }) => {
    try {
      await authApi.confirmResetPassword(data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Không thể đặt lại mật khẩu",
      );
    }
  },
);

export const logoutThunk = createAsyncThunk<void, void>(
  "auth/logout",
  async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue with logout even if API fails
    } finally {
      // Always clear storage
      removeStorage(STORAGE_KEYS.ACCESS_TOKEN);
      removeStorage(STORAGE_KEYS.REFRESH_TOKEN);
      removeStorage(STORAGE_KEYS.USER_INFO);
    }
  },
);
