import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserManageState, FetchUsersPayload, User } from './userManageTypes'
import {
  fetchUsersThunk,
  createUserThunk,
  getUserByIdThunk,
  updateUserThunk,
  updateUserStatusThunk
} from './userManageThunks'

const initialState: UserManageState = {
  users: [],
  selectedUser: null,
  pagination: null,
  filter: {},
  listLoading: false,
  actionLoading: false,
  error: null
}

const userManageSlice = createSlice({
  name: 'userManage',
  initialState,
  reducers: {
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
    resetUserManage: (state) => {
      state.users = []
      state.selectedUser = null
      state.pagination = null
      state.filter = {}
      state.error = null
      state.listLoading = false
      state.actionLoading = false
    }
  },
  extraReducers: (builder) => {
    // Fetch users
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

    // Create user
    builder
      .addCase(createUserThunk.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(createUserThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.actionLoading = false
        state.users.unshift(action.payload)
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload as string
      })

    // Get user by ID
    builder
      .addCase(getUserByIdThunk.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(getUserByIdThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.actionLoading = false
        state.selectedUser = action.payload
      })
      .addCase(getUserByIdThunk.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload as string
      })

    // Update user
    builder
      .addCase(updateUserThunk.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(updateUserThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.actionLoading = false
        const index = state.users.findIndex(user => user._id === action.payload._id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = action.payload
        }
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload as string
      })

    // Update user status
    builder
      .addCase(updateUserStatusThunk.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(updateUserStatusThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.actionLoading = false
        const index = state.users.findIndex(user => user._id === action.payload._id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = action.payload
        }
      })
      .addCase(updateUserStatusThunk.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setFilter,
  clearFilter,
  setSelectedUser,
  clearError,
  resetUserManage
} = userManageSlice.actions

export default userManageSlice.reducer
