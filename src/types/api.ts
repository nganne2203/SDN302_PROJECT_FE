// API Response Types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Some endpoints (e.g. /auth/set-password) return a simpler shape
export interface SimpleResponse {
  success: boolean
  message: string
}

export interface ApiError {
  success: boolean
  message: string
  errors?: Record<string, string[]> | string[]
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: {
    items: T[]
    pagination: PaginationMeta
  }
}

export interface PaginationMeta {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
  captchaToken?: string
}

export interface RegisterRequest {
  fullname: string
  email: string
  password: string
  phone?: string
  addresses?: Array<{
    fullname: string
    phone: string
    addressLine: string
    city: string
    district: string
    ward: string
    isDefault: boolean
  }>
  avatar?: string
  captchaToken?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserInfo
}

export interface VerifyOTPRequest {
  email: string
  code: string
  type: 'verify_email' | 'reset_password' | 'change_password' | 'change_email' | 'change_info'
}

export interface ResendOTPRequest {
  email: string
  type: 'verify_email' | 'reset_password' | 'change_password' | 'change_email' | 'change_info'
}

export interface UserInfo {
  id: string
  email: string
  fullName: string
  phoneNumber?: string
  avatar?: string
  role: UserRole
}

export type UserRole = 'ADMIN' | 'CUSTOMER' | 'STAFF' | 'MANAGER'

// Backend user shape (MongoDB)
export interface BackendUser {
  _id: string
  email: string
  fullname: string
  phone?: string
  avatar?: string
  role: UserRole
}

// /auth/profile returns { user }
export interface ProfileResponse {
  user: BackendUser
}

// /auth/login & /auth/refresh-token return tokens only
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// Product Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  categoryId: string
  categoryName: string
  brand: string
  stock: number
  rating: number
  reviewCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductFilter {
  categoryId?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'price' | 'name' | 'createdAt' | 'rating'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface Branch {
  _id: string
  name: string
  address: string
  manager?: string | null
  isActive: boolean
  createdBy?: string | null
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface BranchFilter {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Cart Types
export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  totalAmount: number
  totalItems: number
}

// Order Types
export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'
export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface ShippingAddress {
  fullName: string
  phoneNumber: string
  province: string
  district: string
  ward: string
  address: string
}

export interface CreateOrderRequest {
  items: { productId: string; quantity: number }[]
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  note?: string
}
