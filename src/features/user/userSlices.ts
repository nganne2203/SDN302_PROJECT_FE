import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserState } from './userTypes'
import type { UserInfo, ShippingAddress } from '@/types/api'
import {
  fetchProfileThunk,
  updateProfileThunk,
  fetchAddressesThunk,
  addAddressThunk
} from './userThunks'

const initialState: UserState = {
  profile: null,
  addresses: [],
  isLoading: false,
  error: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserInfo>) => {
      state.profile = action.payload
    },
    clearProfile: (state) => {
      state.profile = null
      state.addresses = []
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action: PayloadAction<UserInfo>) => {
        state.isLoading = false
        state.profile = action.payload
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfileThunk.fulfilled, (state, action: PayloadAction<UserInfo>) => {
        state.isLoading = false
        state.profile = action.payload
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    builder
      .addCase(fetchAddressesThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchAddressesThunk.fulfilled, (state, action: PayloadAction<ShippingAddress[]>) => {
        state.isLoading = false
        state.addresses = action.payload
      })
      .addCase(fetchAddressesThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    builder
      .addCase(addAddressThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(addAddressThunk.fulfilled, (state, action: PayloadAction<ShippingAddress>) => {
        state.isLoading = false
        state.addresses.push(action.payload)
      })
      .addCase(addAddressThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { setProfile, clearProfile, clearError } = userSlice.actions
export default userSlice.reducer
