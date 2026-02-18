import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { DeviceState, FetchDevicesPayload, Device } from './deviceTypes'
import { initialCacheMetadata, updateCacheMetadata, markCacheAsStale } from '@/utils/cacheHelper'
import {
  fetchDevicesThunk,
  fetchDeviceByIdThunk,
  createDeviceThunk,
  updateDeviceThunk,
  deleteDeviceThunk,
  updateDeviceStatusThunk,
  fetchAllDevicesThunk
} from './deviceThunks'

const initialState: DeviceState = {
  devices: [],
  selectedDevice: null,
  pagination: null,
  filter: {},
  isLoading: false,
  error: null,
  cache: initialCacheMetadata()
}

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.filter = { ...state.filter, ...action.payload }
    },
    clearFilter: (state) => {
      state.filter = {}
    },
    setSelectedDevice: (state, action: PayloadAction<Device | null>) => {
      state.selectedDevice = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    resetDevices: (state) => {
      state.devices = []
      state.selectedDevice = null
      state.pagination = null
      state.filter = {}
      state.error = null
    },
    invalidateDeviceCache: (state) => {
      state.cache = markCacheAsStale()
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevicesThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDevicesThunk.fulfilled, (state, action: PayloadAction<FetchDevicesPayload>) => {
        state.isLoading = false
        state.devices = action.payload.items
        state.pagination = action.payload.pagination
        state.cache = updateCacheMetadata()
      })
      .addCase(fetchDevicesThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(fetchDeviceByIdThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDeviceByIdThunk.fulfilled, (state, action: PayloadAction<Device>) => {
        state.isLoading = false
        state.selectedDevice = action.payload
      })
      .addCase(fetchDeviceByIdThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(createDeviceThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createDeviceThunk.fulfilled, (state, action: PayloadAction<Device>) => {
        state.isLoading = false
        state.devices.unshift(action.payload)
        if (state.pagination) {
          state.pagination.totalItems += 1
          state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.pageSize)
        }
        state.cache = markCacheAsStale()
      })
      .addCase(createDeviceThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(updateDeviceThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateDeviceThunk.fulfilled, (state, action: PayloadAction<Device>) => {
        state.isLoading = false
        const index = state.devices.findIndex(device => device._id === action.payload._id)
        if (index !== -1) {
          state.devices[index] = action.payload
        }
        if (state.selectedDevice?._id === action.payload._id) {
          state.selectedDevice = action.payload
        }
        state.cache = markCacheAsStale()
      })
      .addCase(updateDeviceThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(deleteDeviceThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteDeviceThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.devices = state.devices.filter(device => device._id !== action.payload)
        if (state.selectedDevice?._id === action.payload) {
          state.selectedDevice = null
        }
        if (state.pagination) {
          state.pagination.totalItems -= 1
          state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.pageSize)
        }
        state.cache = markCacheAsStale()
      })
      .addCase(deleteDeviceThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(updateDeviceStatusThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateDeviceStatusThunk.fulfilled, (state, action: PayloadAction<Device>) => {
        state.isLoading = false
        const index = state.devices.findIndex(device => device._id === action.payload._id)
        if (index !== -1) {
          state.devices[index] = action.payload
        }
        if (state.selectedDevice?._id === action.payload._id) {
          state.selectedDevice = action.payload
        }
      })
      .addCase(updateDeviceStatusThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(fetchAllDevicesThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllDevicesThunk.fulfilled, (state, action: PayloadAction<Device[]>) => {
        state.isLoading = false
        state.devices = action.payload
        state.cache = updateCacheMetadata()
      })
      .addCase(fetchAllDevicesThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setFilter,
  clearFilter,
  setSelectedDevice,
  clearError,
  resetDevices,
  invalidateDeviceCache
} = deviceSlice.actions

export default deviceSlice.reducer
