import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CategoryState, FetchCategoriesPayload, Category } from './categoryTypes'
import {
  fetchCategoriesThunk,
  fetchCategoryByIdThunk,
  createCategoryThunk,
  updateCategoryThunk,
  deleteCategoryThunk,
  updateCategoryStatusThunk,
} from './categoryThunks'

const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  pagination: null,
  filter: {},
  isLoading: false,
  error: null,
}

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.filter = { ...state.filter, ...action.payload }
    },
    clearFilter: (state) => {
      state.filter = {}
    },
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    resetCategories: (state) => {
      state.categories = []
      state.selectedCategory = null
      state.pagination = null
      state.filter = {}
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Categories
    builder
      .addCase(fetchCategoriesThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action: PayloadAction<FetchCategoriesPayload>) => {
        state.isLoading = false
        state.categories = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchCategoriesThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Category By ID
    builder
      .addCase(fetchCategoryByIdThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategoryByIdThunk.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false
        state.selectedCategory = action.payload
      })
      .addCase(fetchCategoryByIdThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create Category
    builder
      .addCase(createCategoryThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCategoryThunk.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false
        state.categories.unshift(action.payload)
        if (state.pagination) {
          state.pagination.totalItems += 1
          state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.pageSize)
        }
      })
      .addCase(createCategoryThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update Category
    builder
      .addCase(updateCategoryThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCategoryThunk.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false
        const index = state.categories.findIndex(c => c._id === action.payload._id)
        if (index !== -1) {
          state.categories[index] = action.payload
        }
        if (state.selectedCategory?._id === action.payload._id) {
          state.selectedCategory = action.payload
        }
      })
      .addCase(updateCategoryThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete Category
    builder
      .addCase(deleteCategoryThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteCategoryThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.categories = state.categories.filter(c => c._id !== action.payload)
        if (state.selectedCategory?._id === action.payload) {
          state.selectedCategory = null
        }
        // Cập nhật pagination khi xóa
        if (state.pagination) {
          state.pagination.totalItems -= 1
          state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.pageSize)
        }
      })
      .addCase(deleteCategoryThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    builder
      .addCase(updateCategoryStatusThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCategoryStatusThunk.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false
        const index = state.categories.findIndex(c => c._id === action.payload._id)
        if (index !== -1) {
          state.categories[index] = action.payload
        }
        if (state.selectedCategory?._id === action.payload._id) {
          state.selectedCategory = action.payload
        }
      })
      .addCase(updateCategoryStatusThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setFilter, clearFilter, setSelectedCategory, clearError, resetCategories } = categorySlice.actions
export default categorySlice.reducer
