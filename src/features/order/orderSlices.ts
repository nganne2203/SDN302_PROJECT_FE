import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { OrderState, FetchOrdersPayload } from './orderTypes'
import type { Order } from '@/types/api'
import {
  fetchOrdersThunk,
  fetchAllOrdersThunk,
  fetchOrderByIdThunk,
  createOrderThunk,
  cancelOrderThunk,
  updateOrderStatusThunk
} from './orderThunks'

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  pagination: null,
  isLoading: false,
  error: null
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    clearOrders: (state) => {
      state.orders = []
      state.pagination = null
    }
  },
  extraReducers: (builder) => {
    // Fetch Orders
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action: PayloadAction<FetchOrdersPayload>) => {
        state.isLoading = false
        state.orders = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    // Fetch All Orders (Admin/Staff)
    builder
      .addCase(fetchAllOrdersThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllOrdersThunk.fulfilled, (state, action: PayloadAction<FetchOrdersPayload>) => {
        state.isLoading = false
        state.orders = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAllOrdersThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    // Fetch Order By ID
    builder
      .addCase(fetchOrderByIdThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrderByIdThunk.fulfilled, (state, action: PayloadAction<Order>) => {
        state.isLoading = false
        state.selectedOrder = action.payload
      })
      .addCase(fetchOrderByIdThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    // Create Order
    builder
      .addCase(createOrderThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createOrderThunk.fulfilled, (state, action: PayloadAction<Order>) => {
        state.isLoading = false
        state.orders.unshift(action.payload)
        state.selectedOrder = action.payload
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    // Cancel Order
    builder
      .addCase(cancelOrderThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(cancelOrderThunk.fulfilled, (state, action: PayloadAction<Order>) => {
        state.isLoading = false
        const index = state.orders.findIndex((o) => o.id === action.payload.id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload
        }
      })
      .addCase(cancelOrderThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    // Update Order Status
    builder
      .addCase(updateOrderStatusThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action: PayloadAction<Order>) => {
        state.isLoading = false
        const index = state.orders.findIndex((o) => o.id === action.payload.id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload
        }
      })
      .addCase(updateOrderStatusThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { setSelectedOrder, clearError, clearOrders } = orderSlice.actions
export default orderSlice.reducer
