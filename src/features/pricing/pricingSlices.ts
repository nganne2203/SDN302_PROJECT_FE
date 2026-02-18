import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PricingState, FetchPricingsPayload, PricingRule } from './pricingTypes'
import { initialCacheMetadata, updateCacheMetadata, markCacheAsStale } from '@/utils/cacheHelper'
import {
  fetchPricingsThunk,
  fetchPricingByIdThunk,
  createPricingThunk,
  updatePricingThunk,
  deletePricingThunk,
  togglePricingStatusThunk,
  bulkCreatePricingThunk
} from './pricingThunks'

const initialState: PricingState = {
  pricings: [],
  selectedPricing: null,
  pagination: null,
  filter: {},
  isLoading: false,
  error: null,
  cache: initialCacheMetadata()
}

const pricingSlice = createSlice({
  name: 'pricing',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.filter = { ...state.filter, ...action.payload }
    },
    clearFilter: (state) => {
      state.filter = {}
    },
    setSelectedPricing: (state, action: PayloadAction<PricingRule | null>) => {
      state.selectedPricing = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    resetPricings: (state) => {
      state.pricings = []
      state.selectedPricing = null
      state.pagination = null
      state.filter = {}
      state.error = null
    },
    invalidatePricingCache: (state) => {
      state.cache = markCacheAsStale()
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPricingsThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPricingsThunk.fulfilled, (state, action: PayloadAction<FetchPricingsPayload>) => {
        state.isLoading = false
        state.pricings = action.payload.items
        state.pagination = action.payload.pagination
        state.cache = updateCacheMetadata()
      })
      .addCase(fetchPricingsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(fetchPricingByIdThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPricingByIdThunk.fulfilled, (state, action: PayloadAction<PricingRule>) => {
        state.isLoading = false
        state.selectedPricing = action.payload
      })
      .addCase(fetchPricingByIdThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(createPricingThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPricingThunk.fulfilled, (state, action: PayloadAction<PricingRule>) => {
        state.isLoading = false
        state.pricings.unshift(action.payload)
        if (state.pagination) {
          state.pagination.totalItems += 1
          state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.pageSize)
        }
        state.cache = markCacheAsStale()
      })
      .addCase(createPricingThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(updatePricingThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePricingThunk.fulfilled, (state, action: PayloadAction<PricingRule>) => {
        state.isLoading = false
        const index = state.pricings.findIndex(pricing => pricing._id === action.payload._id)
        if (index !== -1) {
          state.pricings[index] = action.payload
        }
        if (state.selectedPricing?._id === action.payload._id) {
          state.selectedPricing = action.payload
        }
        state.cache = markCacheAsStale()
      })
      .addCase(updatePricingThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(deletePricingThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deletePricingThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.pricings = state.pricings.filter(pricing => pricing._id !== action.payload)
        if (state.selectedPricing?._id === action.payload) {
          state.selectedPricing = null
        }
        if (state.pagination) {
          state.pagination.totalItems -= 1
          state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.pageSize)
        }
        state.cache = markCacheAsStale()
      })
      .addCase(deletePricingThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(togglePricingStatusThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(togglePricingStatusThunk.fulfilled, (state, action: PayloadAction<PricingRule>) => {
        state.isLoading = false
        const index = state.pricings.findIndex(pricing => pricing._id === action.payload._id)
        if (index !== -1) {
          state.pricings[index] = action.payload
        }
        if (state.selectedPricing?._id === action.payload._id) {
          state.selectedPricing = action.payload
        }
      })
      .addCase(togglePricingStatusThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(bulkCreatePricingThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(bulkCreatePricingThunk.fulfilled, (state) => {
        state.isLoading = false
        state.cache = markCacheAsStale()
      })
      .addCase(bulkCreatePricingThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setFilter,
  clearFilter,
  setSelectedPricing,
  clearError,
  resetPricings,
  invalidatePricingCache
} = pricingSlice.actions

export default pricingSlice.reducer
