import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ServiceProductState, ServiceProduct, ServiceProductFilter } from './serviceProductTypes'
import {
  fetchServicesThunk,
  createServiceThunk,
  getServiceByIdThunk,
  updateServiceThunk,
  deleteServiceThunk,
  updateServiceStatusThunk
} from './serviceProductThunks'

const initialState: ServiceProductState = {
  services: [],
  pagination: null,
  listLoading: false,
  actionLoading: false,
  filter: {},
  error: null,
  selectedService: null
}

const serviceProductSlice = createSlice({
  name: 'serviceProduct',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<ServiceProductFilter>) => {
      state.filter = action.payload
    },
    clearFilter: (state) => {
      state.filter = {}
    },
    setSelectedService: (state, action: PayloadAction<ServiceProduct | null>) => {
      state.selectedService = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch Services
    builder
      .addCase(fetchServicesThunk.pending, (state) => {
        state.listLoading = true
        state.error = null
      })
      .addCase(fetchServicesThunk.fulfilled, (state, action) => {
        state.listLoading = false
        state.services = action.payload.data
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination
        }
      })
      .addCase(fetchServicesThunk.rejected, (state, action) => {
        state.listLoading = false
        state.error = action.payload as string
      })

    // Create Service
    builder
      .addCase(createServiceThunk.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(createServiceThunk.fulfilled, (state) => {
        state.actionLoading = false
      })
      .addCase(createServiceThunk.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload as string
      })

    // Get Service By Id
    builder
      .addCase(getServiceByIdThunk.pending, (state) => {
        state.listLoading = true // Or use a separate loading state
        state.error = null
      })
      .addCase(getServiceByIdThunk.fulfilled, (state, action) => {
        state.listLoading = false
        state.selectedService = action.payload
      })
      .addCase(getServiceByIdThunk.rejected, (state, action) => {
        state.listLoading = false
        state.error = action.payload as string
      })

    // Update Service
    builder
      .addCase(updateServiceThunk.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(updateServiceThunk.fulfilled, (state, action) => {
        state.actionLoading = false
        // Update the service in the list
        const index = state.services.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.services[index] = action.payload
        }
      })
      .addCase(updateServiceThunk.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload as string
      })

    // Delete Service
    builder
      .addCase(deleteServiceThunk.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(deleteServiceThunk.fulfilled, (state, action) => {
        state.actionLoading = false
        // Remove the service from the list
        state.services = state.services.filter(s => s._id !== action.payload)
      })
      .addCase(deleteServiceThunk.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload as string
      })

    // Update Service Status
    builder
      .addCase(updateServiceStatusThunk.fulfilled, (state, action) => {
        // Optimistic update support - update list
        const index = state.services.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.services[index] = action.payload
        }
      })
      // We might not need pending/rejected for status toggle if handled optimistically or subtly in UI
  }
})

export const { setFilter, clearFilter, setSelectedService, clearError } = serviceProductSlice.actions
export default serviceProductSlice.reducer
