import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserState, FetchUsersPayload, User } from './userTypes'
import type { UserInfo, ShippingAddress } from '@/types/api'
import { 
  fetchUsersThunk,
  fetchProfileThunk, 
  updateProfileThunk, 
  fetchAddressesThunk,
  addAddressThunk,
  updateUserStatusThunk,
} from './userThunks'

const initialState: UserState = {
  profile: null,
  addresses: [],
  users: [],
  selectedUser: null,
  pagination: null,
  filter: {},
  isLoading: false,
  listLoading: false,
  error: null,
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
    setFilter: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.filter = { ...state.filter, ...action.payload }
    },
    clearFilter: (state) => {
      state.filter = {}
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    resetUsers: (state) => {
      state.users = []
      state.selectedUser = null
      state.pagination = null
      state.filter = {}
      state.error = null
      state.listLoading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.listLoading = true
        state.error = null
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action: PayloadAction<FetchUsersPayload>) => {
        state.listLoading = false
        state.users = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.listLoading = false
        state.error = action.payload as string
      })

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
    builder
      .addCase(updateUserStatusThunk.pending, (state) => {
        state.listLoading = true
        state.error = null
      })
      .addCase(updateUserStatusThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.listLoading = false
        const index = state.users.findIndex(u => u._id === action.payload._id)
        if (index !== -1) {
          state.users[index] = action.payload
        }

        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = action.payload
        }
      })
      .addCase(updateUserStatusThunk.rejected, (state, action) => {
        state.listLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setProfile, clearProfile, setFilter, clearFilter, setSelectedUser, clearError, resetUsers } = userSlice.actions
export default userSlice.reducer
