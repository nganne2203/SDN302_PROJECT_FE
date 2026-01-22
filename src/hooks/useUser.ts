import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/apps/hooks";
import {
  fetchProfileThunk,
  updateProfileThunk,
  fetchAddressesThunk,
  addAddressThunk,
} from "@/features/user/userThunks";
import { clearProfile, clearError } from "@/features/user/userSlices";
import type { UpdateProfilePayload } from "@/features/user/userTypes";
import type { ShippingAddress } from "@/types/api";

export const useUser = () => {
  const dispatch = useAppDispatch();
  const { profile, addresses, isLoading, error } = useAppSelector(
    (state) => state.user,
  );

  const fetchProfile = useCallback(() => {
    dispatch(fetchProfileThunk());
  }, [dispatch]);

  const updateProfile = useCallback(
    async (data: UpdateProfilePayload) => {
      const result = await dispatch(updateProfileThunk(data));
      return updateProfileThunk.fulfilled.match(result);
    },
    [dispatch],
  );

  const fetchAddresses = useCallback(() => {
    dispatch(fetchAddressesThunk());
  }, [dispatch]);

  const addAddress = useCallback(
    async (address: ShippingAddress) => {
      const result = await dispatch(addAddressThunk(address));
      return addAddressThunk.fulfilled.match(result);
    },
    [dispatch],
  );

  const resetProfile = useCallback(() => {
    dispatch(clearProfile());
  }, [dispatch]);

  const clearUserError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    profile,
    addresses,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    fetchAddresses,
    addAddress,
    resetProfile,
    clearUserError,
  };
};

export default useUser;
