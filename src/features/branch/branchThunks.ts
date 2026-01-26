import { createAsyncThunk } from '@reduxjs/toolkit'
import { getBranches } from '@/apis/branch'
import type { BranchFilter } from '@/types/api'

export const fetchBranchesThunk = createAsyncThunk(
  'branch/fetchBranches',
  async (filter: BranchFilter, { rejectWithValue }) => {
    try {
      const response = await getBranches(filter)
      return response
    } catch (error: unknown) {
      const err = error as { message?: string }
      return rejectWithValue(err.message || 'Không thể lấy danh sách chi nhánh')
    }
  }
)
