import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ProductState, FetchProductsPayload } from './productTypes'
import type { Product, ProductFilter } from '@/types/api'
import { fetchProductsThunk, fetchProductByIdThunk, fetchCategoriesThunk } from './productThunks'

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  filter: {},
  pagination: null,
  categories: [],
  isLoading: false,
  error: null
}

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<ProductFilter>) => {
      state.filter = { ...state.filter, ...action.payload }
    },
    clearFilter: (state) => {
      state.filter = {}
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action: PayloadAction<FetchProductsPayload>) => {
        state.isLoading = false
        state.products = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    // Fetch Product By ID
    builder
      .addCase(fetchProductByIdThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProductByIdThunk.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false
        state.selectedProduct = action.payload
      })
      .addCase(fetchProductByIdThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    // Fetch Categories
    builder
      .addCase(fetchCategoriesThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = action.payload
      })
      .addCase(fetchCategoriesThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { setFilter, clearFilter, setSelectedProduct, clearError } = productSlice.actions
export default productSlice.reducer
