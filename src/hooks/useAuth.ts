import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/apps/hooks";
import {
  loginThunk,
  registerThunk,
  logoutThunk,
  resetPasswordThunk,
  changePasswordThunk,
  verifyOTPThunk,
  confirmResetPasswordThunk,
} from "@/features/auth/authThunks";
import { clearCredentials, clearError } from "@/features/auth/authSlices";
import type {
  LoginPayload,
  RegisterPayload,
  VerifyOTPPayLoad,
} from "@/features/auth/authTypes";
import { ROUTES } from "@/constants/constant";
import type { ChangePasswordPayload } from "@/features/user/userTypes";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading, error } = useAppSelector(
    (state) => state.auth,
  );

  const login = useCallback(
    async (credentials: LoginPayload) => {
      const result = await dispatch(loginThunk(credentials));
      if (loginThunk.fulfilled.match(result)) {
        navigate(ROUTES.HOME);
        return true;
      }
      return false;
    },
    [dispatch, navigate],
  );

  const register = useCallback(
    async (data: RegisterPayload) => {
      const result = await dispatch(registerThunk(data));
      if (registerThunk.fulfilled.match(result)) {
        navigate(ROUTES.HOME);
        return true;
      }
      return false;
    },
    [dispatch, navigate],
  );

  const changePassword = useCallback(
    async (data: ChangePasswordPayload) => {
      const result = await dispatch(changePasswordThunk(data));
      return changePasswordThunk.fulfilled.match(result);
    },
    [dispatch],
  );

  const resetPassword = useCallback(
    async (data: string) => {
      const result = await dispatch(resetPasswordThunk(data));
      return resetPasswordThunk.fulfilled.match(result);
    },
    [dispatch],
  );

  const verifyOTP = useCallback(
    async (data: VerifyOTPPayLoad) => {
      const result = await dispatch(verifyOTPThunk(data));
      return verifyOTPThunk.fulfilled.match(result);
    },
    [dispatch],
  );

  const confirmResetPassword = useCallback(
    async (data: LoginPayload) => {
      const result = await dispatch(confirmResetPasswordThunk(data));
      return confirmResetPasswordThunk.fulfilled.match(result);
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    await dispatch(logoutThunk());
    dispatch(clearCredentials());
    navigate(ROUTES.LOGIN);
  }, [dispatch, navigate]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    register,
    changePassword,
    resetPassword,
    verifyOTP,
    confirmResetPassword,
    logout,
    clearAuthError,
  };
};

export default useAuth;
