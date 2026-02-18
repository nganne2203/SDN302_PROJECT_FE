import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlices'
import productReducer from '@/features/product/productSlices'
import orderReducer from '@/features/order/orderSlices'
import userReducer from '@/features/user/userSlices'
import categoryReducer from '@/features/category/categorySlices'
import userManageReducer from '@/features/userManage/userManageSlices'
import branchReducer from '@/features/branch/branchSlices'
import deviceReducer from '@/features/device/deviceSlices'
import pricingReducer from '@/features/pricing/pricingSlices'
import staffReducer from '@/features/staff/staffSlice'
import reviewReducer from '@/features/review/reviewSlice'

import serviceProductReducer from '@/features/serviceProduct/serviceProductSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  product: productReducer,
  order: orderReducer,
  user: userReducer,
  category: categoryReducer,
  userManage: userManageReducer,
  branch: branchReducer,
  serviceProduct: serviceProductReducer,
  device: deviceReducer,
  pricing: pricingReducer,
  staff: staffReducer,
  review: reviewReducer
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer
