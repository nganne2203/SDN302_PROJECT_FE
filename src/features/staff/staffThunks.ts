import { createAsyncThunk } from '@reduxjs/toolkit'
import { userManageApi } from '@/apis/userManage'
import { extractApiError } from '@/utils/apiError'
import type { UserManageFilter } from '@/types/api'
import type { FetchStaffPayload } from './staffTypes'

export const fetchStaffThunk = createAsyncThunk<FetchStaffPayload, UserManageFilter | undefined>(
  'staff/fetchStaff',
  async (filter, { rejectWithValue }) => {
    try {
      const response = await userManageApi.getStaff(filter)
      return {
        items: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải danh sách nhân viên'))
    }
  }
)
