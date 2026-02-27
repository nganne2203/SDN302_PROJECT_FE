import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ProductState, FetchProductsPayload } from './productTypes'
import type { Product, ProductFilter } from '@/types/api'
import { initialCacheMetadata, updateCacheMetadata, markCacheAsStale } from '@/utils/cacheHelper'
import {
  fetchProductsThunk,
  fetchProductByIdThunk,
  fetchCategoriesThunk,
  createProductThunk,
  updateProductThunk,
  deleteProductThunk,
  updateProductStatusThunk,
  fetchFeaturedProductsThunk,
  fetchNewArrivalsThunk,
  fetchRelatedProductsThunk,
  searchProductsThunk
} from './productThunks'

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  filter: {},
  pagination: null,
  categories: [],
  featuredProducts: [],
  newArrivals: [],
  relatedProducts: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  cache: {
    products: initialCacheMetadata(),
    featuredProducts: initialCacheMetadata(),
    newArrivals: initialCacheMetadata(),
    categories: initialCacheMetadata(),
    relatedProducts: {},
    productDetail: {}
  }
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
    },
    clearProducts: (state) => {
      state.products = []
      state.pagination = null
    },
    invalidateProductCache: (state) => {
      state.cache.products = markCacheAsStale()
      state.cache.featuredProducts = markCacheAsStale()
      state.cache.newArrivals = markCacheAsStale()
    },
    invalidateAllCache: (state) => {
      state.cache.products = markCacheAsStale()
      state.cache.featuredProducts = markCacheAsStale()
      state.cache.newArrivals = markCacheAsStale()
      state.cache.categories = markCacheAsStale()
      state.cache.relatedProducts = {}
      state.cache.productDetail = {}
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
        state.products = action.payload.data
        state.pagination = action.payload.pagination
        state.cache.products = updateCacheMetadata()
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
        state.selectedProduct = null
      })
      .addCase(fetchProductByIdThunk.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false
        state.selectedProduct = action.payload
        state.cache.productDetail[action.payload._id] = updateCacheMetadata()
      })
      .addCase(fetchProductByIdThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create Product
    builder
      .addCase(createProductThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createProductThunk.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isSubmitting = false
        state.products.unshift(action.payload)
        // Invalidate cache when new product is created
        state.cache.products = markCacheAsStale()
        state.cache.featuredProducts = markCacheAsStale()
        state.cache.newArrivals = markCacheAsStale()
      })
      .addCase(createProductThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

    // Update Product
    builder
      .addCase(updateProductThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updateProductThunk.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isSubmitting = false
        const index = state.products.findIndex((p) => p._id === action.payload._id)
        if (index !== -1) {
          state.products[index] = action.payload
        }
        if (state.selectedProduct?._id === action.payload._id) {
          state.selectedProduct = action.payload
        }
        // Invalidate cache when product is updated
        state.cache.products = markCacheAsStale()
        state.cache.featuredProducts = markCacheAsStale()
        state.cache.newArrivals = markCacheAsStale()
        state.cache.productDetail[action.payload._id] = markCacheAsStale()
      })
      .addCase(updateProductThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

    // Delete Product
    builder
      .addCase(deleteProductThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(deleteProductThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.isSubmitting = false
        state.products = state.products.filter((p) => p._id !== action.payload)
        // Invalidate cache when product is deleted
        state.cache.products = markCacheAsStale()
        state.cache.featuredProducts = markCacheAsStale()
        state.cache.newArrivals = markCacheAsStale()
        delete state.cache.productDetail[action.payload]
      })
      .addCase(deleteProductThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })

    // Update Product Status
    builder
      .addCase(updateProductStatusThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updateProductStatusThunk.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isSubmitting = false
        const index = state.products.findIndex((p) => p._id === action.payload._id)
        if (index !== -1) {
          state.products[index] = action.payload
        }
        if (state.selectedProduct?._id === action.payload._id) {
          state.selectedProduct = action.payload
        }
        state.cache.products = markCacheAsStale()
        state.cache.featuredProducts = markCacheAsStale()
        state.cache.newArrivals = markCacheAsStale()
        state.cache.productDetail[action.payload._id] = markCacheAsStale()
      })
      .addCase(updateProductStatusThunk.rejected, (state, action) => {
        state.isSubmitting = false
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
        state.cache.categories = updateCacheMetadata()
      })
      .addCase(fetchCategoriesThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Featured Products
    builder
      .addCase(fetchFeaturedProductsThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchFeaturedProductsThunk.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.isLoading = false
        state.featuredProducts = action.payload
        state.cache.featuredProducts = updateCacheMetadata()
      })
      .addCase(fetchFeaturedProductsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch New Arrivals
    builder
      .addCase(fetchNewArrivalsThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchNewArrivalsThunk.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.isLoading = false
        state.newArrivals = action.payload
        state.cache.newArrivals = updateCacheMetadata()
      })
      .addCase(fetchNewArrivalsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Related Products
    builder
      .addCase(fetchRelatedProductsThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchRelatedProductsThunk.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.isLoading = false
        state.relatedProducts = action.payload
      })
      .addCase(fetchRelatedProductsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Search Products
    builder
      .addCase(searchProductsThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(searchProductsThunk.fulfilled, (state, action: PayloadAction<FetchProductsPayload>) => {
        state.isLoading = false
        state.products = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(searchProductsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setFilter,
  clearFilter,
  setSelectedProduct,
  clearError,
  clearProducts,
  invalidateProductCache,
  invalidateAllCache
} = productSlice.actions
export default productSlice.reducer
