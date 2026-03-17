import type { Address } from '@/features/user/userTypes'

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta | null;
}

export interface SimpleResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  errors: string[];
}

export const ERROR_CODES = {
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  captchaToken?: string;
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  password: string;
  phone?: string;
  addresses?: Array<{
    fullname: string;
    phone: string;
    addressLine: string;
    city: string;
    ward: string;
    provinceCode?: number;
    wardCode?: number;
    isDefault: boolean;
  }>;
  avatar?: string;
  captchaToken?: string;
}

export type OTPType =
  | 'verify_email'
  | 'reset_password'
  | 'change_password'
  | 'change_email'
  | 'change_info';

export interface VerifyOTPRequest {
  email: string;
  code: string;
  type: OTPType;
}

export interface ResendOTPRequest {
  email: string;
  type: OTPType;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ConfirmResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface SetPasswordRequest {
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UploadedImage {
  imageUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt?: string;
}

export type UploadMultipleImagesResponse = UploadedImage[]

export interface VerifyOTPResponse {
  accessToken?: string;
  refreshToken?: string;
}

export interface RegisterResponse {
  _id: string;
  email: string;
  fullname: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
}

export type UserRole = 'admin' | 'customer' | 'staff' | 'manager';

export interface UserInfo {
  id: string;
  email: string;
  fullname: string;
  phone?: string;
  avatarId?: string;
  avatar?: string;
  role: UserRole;
  branch?: string | null;
  isEmailVerified?: boolean;
  addresses?: Address[];
}

export interface BackendUser {
  _id: string;
  email: string;
  fullname: string;
  phone?: string;
  avatarId?: string;
  avatar?: string;
  role: UserRole;
  branch?: string | null;
  isEmailVerified?: boolean;
  addresses?: Address[];
}

export interface ProfileResponse {
  user: BackendUser;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  branch?: string | null;
  exp: number;
  iat: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  price: number;
  images: Image[] | Image | string[]; // Support multiple formats from different APIs
  material?: string;
  compatibility?: (string | { _id: string; name: string })[];
  ratingAvg: number;
  ratingCount: number;
  isActive: boolean;
  totalStock?: number;
  inStock?: boolean;
  stockByBranch?: Array<{
    branch: Branch;
    quantity: number;
    inStock: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  imageUrl: string;
  publicId: string;
}

export interface ProductFilter {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'ratingAvg' | 'ratingCount';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductRequest {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  images: string[];
  material?: string;
  compatibility?: string[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  images?: string[];
  material?: string;
  compatibility?: string[];
}

export interface UpdateProductStatusRequest {
  isActive: boolean;
}

export interface ProductWithStock extends Product {
  stockInfo?: {
    available: boolean;
    quantity: number;
  };
}

export interface Branch {
  _id: string;
  name: string;
  address: string;
  manager?: {
    id: string;
    name: string;
  } | null;
  isActive: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BranchFilter {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InventoryRecord {
  _id: string;
  product: Product;
  quantity: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreInventoryRecord {
  _id: string;
  branch: Branch;
  product: Product;
  quantity: number;
  minThreshold: number;
  maxThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export type StockRequestStatus = 'pending' | 'approved' | 'partially_approved' | 'rejected';

export interface StockRequestRecord {
  _id: string;
  branch: Branch;
  product: Product;
  quantity: number;
  approvedQuantity?: number;
  requester: BackendUser;
  reason?: string;
  status: StockRequestStatus;
  admin?: BackendUser | null;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  services?: { serviceId: string; name: string; price: number }[];
  serviceFee?: number;
  totalPrice?: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export interface Order {
  _id?: string;
  orderNumber?: string;
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal?: number;
  shippingFee?: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod | 'cod' | 'vnpay' | 'bank_transfer' | 'credit_card' | 'e_wallet';
  paymentStatus?: PaymentStatus | string;
  payment?: {
    status?: string;
    paidAt?: string;
    failureReason?: string;
  } | null;
  delivery?: DeliveryInfo | null;
  message?: string;
  branch?: Branch | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryInfo {
  status?: 'pending' | 'shipping' | 'delivered' | 'cancelled' | 'failed' | string;
  providerName?: string;
  trackingCode?: string;
  estimatedDeliveryDate?: string | null;
  deliveredAt?: string | null;
  recipientName?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
export type PaymentMethod =
  | 'COD'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'E_WALLET';
// BE now returns lowercase payment status strings on order detail/list.
// Keep legacy uppercase variants for backward compatibility.
export type PaymentStatus =
  | 'pending'
  | 'success'
  | 'failed'
  | 'refunded'
  | 'canceled'
  | 'cancelled'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  province: string;
  ward: string;
  provinceCode?: number;
  wardCode?: number;
  address: string;
}

export interface CreateOrderRequest {
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  note?: string;
}

// User Management Types
export interface CreateUserRequest {
  fullname: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  branch?: string;
  addresses?: Array<{
    fullname: string;
    phone: string;
    addressLine: string;
    city: string;
    ward: string;
    provinceCode?: number;
    wardCode?: number;
    isDefault: boolean;
  }>;
  avatar?: string;
}

export interface UpdateUserRequest {
  fullname?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  branch?: string;
  avatar?: string;
  addresses?: Array<{
    fullname: string;
    phone: string;
    addressLine: string;
    city: string;
    ward: string;
    isDefault: boolean;
  }>;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface UserManageFilter {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  role?: UserRole;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
