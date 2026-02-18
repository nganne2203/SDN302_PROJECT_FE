import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { StaffState, FetchStaffPayload } from './staffTypes'
import { fetchStaffThunk } from './staffThunks'

const initialState: StaffState = {
  staffList: [],
  selectedStaff: null,
  pagination: null,
  filter: {},
  listLoading: false,
  actionLoading: false,
  error: null
}

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.filter = { ...state.filter, ...action.payload }
    },
    clearFilter: (state) => {
      state.filter = {}
    },
    clearError: (state) => {
      state.error = null
    },
    resetStaff: (state) => {
      state.staffList = []
      state.selectedStaff = null
      state.pagination = null
      state.filter = {}
      state.error = null
      state.listLoading = false
      state.actionLoading = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffThunk.pending, (state) => {
        state.listLoading = true
        state.error = null
      })
      .addCase(fetchStaffThunk.fulfilled, (state, action: PayloadAction<FetchStaffPayload>) => {
        state.listLoading = false
        state.staffList = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchStaffThunk.rejected, (state, action) => {
        state.listLoading = false
        state.error = action.payload as string
      })
  }
})

export const { setFilter, clearFilter, clearError, resetStaff } = staffSlice.actions
export default staffSlice.reducer
