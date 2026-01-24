import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlices'
import productReducer from '@/features/product/productSlices'
import orderReducer from '@/features/order/orderSlices'
import userReducer from '@/features/user/userSlices'
import categoryReducer from '@/features/category/categorySlices'

const rootReducer = combineReducers({
  auth: authReducer,
  product: productReducer,
  order: orderReducer,
  user: userReducer,
  category: categoryReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer
