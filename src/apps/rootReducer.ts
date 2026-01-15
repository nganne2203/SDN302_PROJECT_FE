import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlices'
import productReducer from '@/features/product/productSlices'
import orderReducer from '@/features/order/orderSlices'
import userReducer from '@/features/user/userSlices'

const rootReducer = combineReducers({
  auth: authReducer,
  product: productReducer,
  order: orderReducer,
  user: userReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer
