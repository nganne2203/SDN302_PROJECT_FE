import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { initialBranchState } from './branchTypes'
import { fetchBranchesThunk } from './branchThunks'
import type { Branch, BranchFilter } from '@/types/api'

const branchSlice = createSlice({
  name: 'branch',
  initialState: initialBranchState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<BranchFilter>>) => {
      state.filter = { ...state.filter, ...action.payload }
    },
    setSelectedBranch: (state, action: PayloadAction<Branch | null>) => {
      state.selectedBranch = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    resetBranchState: () => initialBranchState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch branches
      .addCase(fetchBranchesThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBranchesThunk.fulfilled, (state, action) => {
        state.loading = false
        state.branches = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchBranchesThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setFilter, setSelectedBranch, clearError, resetBranchState } = branchSlice.actions
export default branchSlice.reducer
