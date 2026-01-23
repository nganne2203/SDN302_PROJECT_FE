export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination?: PaginationMeta | null
}

export interface SimpleResponse {
  success: boolean
  message: string
}

export interface ApiError {
  success: false
  code: string
  message: string
  errors: string[]
}

export const ERROR_CODES = {
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: PaginationMeta
}

export interface PaginationMeta {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

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

export type OTPType = 'verify_email' | 'reset_password' | 'change_password' | 'change_email' | 'change_info'

export interface VerifyOTPRequest {
  email: string
  code: string
  type: OTPType
}

export interface ResendOTPRequest {
  email: string
  type: OTPType
}

export interface ResetPasswordRequest {
  email: string
}

export interface ConfirmResetPasswordRequest {
  email: string
  newPassword: string
}

export interface SetPasswordRequest {
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface VerifyOTPResponse {
  accessToken?: string
  refreshToken?: string
}

export interface RegisterResponse {
  _id: string
  email: string
  fullname: string
  phone?: string
  avatar?: string
  role: UserRole
  isEmailVerified: boolean
}

export type UserRole = 'admin' | 'customer' | 'staff' | 'manager'

export interface UserInfo {
  id: string
  email: string
  fullName: string
  phoneNumber?: string
  avatar?: string
  role: UserRole
  branch?: string | null
  isEmailVerified?: boolean
}

export interface BackendUser {
  _id: string
  email: string
  fullname: string
  phone?: string
  avatar?: string
  role: UserRole
  branch?: string | null
  isEmailVerified?: boolean
}

export interface ProfileResponse {
  user: BackendUser
}

export interface TokenPayload {
  id: string
  email: string
  role: UserRole
  branch?: string | null
  exp: number
  iat: number
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserInfo
}

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
