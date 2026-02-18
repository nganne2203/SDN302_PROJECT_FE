import { createAsyncThunk } from '@reduxjs/toolkit'
import { categoryApi } from '@/apis/category'
import { extractApiError } from '@/utils/apiError'
import type { Category, CategoryFilter, CreateCategoryPayload, FetchCategoriesPayload } from './categoryTypes'

export const fetchCategoriesThunk = createAsyncThunk<FetchCategoriesPayload, CategoryFilter | undefined>(
  'category/fetchCategories',
  async (filter, { rejectWithValue }) => {
    try {
      const response = await categoryApi.getCategories(filter)
      const payload = {
        items: response.data,
        pagination: response.pagination
      }
      return payload
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải danh sách danh mục'))
    }
  }
)

export const fetchCategoryByIdThunk = createAsyncThunk<Category, string>(
  'category/fetchCategoryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await categoryApi.getCategoryById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tải thông tin danh mục'))
    }
  }
)

export const createCategoryThunk = createAsyncThunk<Category, CreateCategoryPayload>(
  'category/createCategory',
  async (data, { rejectWithValue }) => {
    try {
      const response = await categoryApi.createCategory(data)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể tạo danh mục'))
    }
  }
)

export const updateCategoryThunk = createAsyncThunk<
  Category,
  { id: string; data: CreateCategoryPayload }
>(
  'category/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await categoryApi.updateCategory(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể cập nhật danh mục'))
    }
  }
)

export const deleteCategoryThunk = createAsyncThunk<string, string>(
  'category/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await categoryApi.deleteCategory(id)
      return id
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể xóa danh mục'))
    }
  }
)

export const updateCategoryStatusThunk = createAsyncThunk<Category, { id: string; isActive: boolean }>(
  'category/updateCategoryStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await categoryApi.updateCategoryStatus(id, isActive)
      return response.data
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Không thể cập nhật trạng thái danh mục'))
    }
  }
)
