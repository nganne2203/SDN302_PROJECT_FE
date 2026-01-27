import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { BranchState, Branch, FetchBranchesPayload, BranchFilter } from './branchTypes'
import {
  fetchBranchesThunk,
  fetchBranchByIdThunk,
  createBranchThunk,
  updateBranchThunk,
  updateBranchStatusThunk,
  assignBranchManagerThunk,
  removeBranchManagerThunk
} from './branchThunks'

const initialState: BranchState = {
  branches: [],
  selectedBranch: null,
  pagination: null,
  filter: {},
  isLoading: false,
  error: null
}

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.filter = { ...state.filter, ...action.payload } as BranchFilter
    },
    clearFilter: (state) => {
      state.filter = {}
    },
    setSelectedBranch: (state, action: PayloadAction<Branch | null>) => {
      state.selectedBranch = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    resetBranches: (state) => {
      state.branches = []
      state.selectedBranch = null
      state.pagination = null
      state.filter = {}
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch branches
      .addCase(fetchBranchesThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBranchesThunk.fulfilled, (state, action: PayloadAction<FetchBranchesPayload>) => {
        state.isLoading = false
        state.branches = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchBranchesThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(fetchBranchByIdThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBranchByIdThunk.fulfilled, (state, action: PayloadAction<Branch>) => {
        state.isLoading = false
        state.selectedBranch = action.payload
      })
      .addCase(fetchBranchByIdThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(createBranchThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBranchThunk.fulfilled, (state, action: PayloadAction<Branch>) => {
        state.isLoading = false
        state.branches.unshift(action.payload)
        if (state.pagination) {
          state.pagination.totalItems += 1
          state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.pageSize)
        }
      })
      .addCase(createBranchThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(updateBranchThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateBranchThunk.fulfilled, (state, action: PayloadAction<Branch>) => {
        state.isLoading = false
        const idx = state.branches.findIndex(b => b._id === action.payload._id)
        if (idx !== -1) state.branches[idx] = action.payload
        if (state.selectedBranch?._id === action.payload._id) state.selectedBranch = action.payload
      })
      .addCase(updateBranchThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(updateBranchStatusThunk.fulfilled, (state, action: PayloadAction<Branch>) => {
        const idx = state.branches.findIndex(b => b._id === action.payload._id)
        if (idx !== -1) state.branches[idx] = action.payload
        if (state.selectedBranch?._id === action.payload._id) state.selectedBranch = action.payload
      })
      .addCase(updateBranchStatusThunk.rejected, (state, action) => {
        state.error = action.payload as string
      })

      .addCase(assignBranchManagerThunk.fulfilled, (state, action: PayloadAction<Branch>) => {
        const idx = state.branches.findIndex(b => b._id === action.payload._id)
        if (idx !== -1) state.branches[idx] = action.payload
        if (state.selectedBranch?._id === action.payload._id) state.selectedBranch = action.payload
      })
      .addCase(assignBranchManagerThunk.rejected, (state, action) => {
        state.error = action.payload as string
      })

      .addCase(removeBranchManagerThunk.fulfilled, (state, action: PayloadAction<Branch>) => {
        const idx = state.branches.findIndex(b => b._id === action.payload._id)
        if (idx !== -1) state.branches[idx] = action.payload
        if (state.selectedBranch?._id === action.payload._id) state.selectedBranch = action.payload
      })
      .addCase(removeBranchManagerThunk.rejected, (state, action) => {
        state.error = action.payload as string
      })
  }
})

export const { setFilter, clearFilter, setSelectedBranch, clearError, resetBranches } = branchSlice.actions
export default branchSlice.reducer
