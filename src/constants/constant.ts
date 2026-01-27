import type { UserRole } from '@/types/api'

export type { UserRole }

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  CART: 'cart',
  THEME: 'theme',
  LANGUAGE: 'language',
  HAS_PASSWORD: 'has_password',
  PENDING_EMAIL: 'pending_email'
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    LOGOUT_ALL: '/api/auth/logout-all',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESEND_OTP: '/api/auth/resend-verification-code',
    PROFILE: '/api/auth/profile',
    SET_PASSWORD: '/api/auth/set-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    CONFIRM_RESET_PASSWORD: '/api/auth/confirm-reset-password',
    GOOGLE_LOGIN: '/api/auth/google',
    GOOGLE_CALLBACK: '/api/auth/google/callback'
  },
  USER: {
    ALL_USERS: '/api/users',
    CREATE_USER: '/api/users',
    GET_MANAGER: '/api/users/manager',
    PROFILE: '/api/auth/profile',
    UPDATE_PROFILE: '/api/users/me',
    DETAIL: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
    UPDATE_STATUS: (id: string) => `/api/users/${id}/status`,
    CHANGE_PASSWORD: '/api/auth/change-password',
    ADDRESSES: '/api/users/addresses'
  },
  PRODUCT: {
    LIST: '/api/products',
    DETAIL: (id: string) => `/api/products/${id}`,
    CATEGORIES: '/api/products/categories',
    SEARCH: '/api/products/search'
  },
  CATEGORY: {
    LIST: '/api/category',
    DETAIL: (id: string) => `/api/category/${id}`,
    CREATE: '/api/category',
    UPDATE: (id: string) => `/api/category/${id}`,
    DELETE: (id: string) => `/api/category/${id}`,
    UPDATE_STATUS: (id: string) => `/api/category/${id}/status`
  },
  BRANCH: {
    LIST: '/api/branch',
    DETAIL: (id: string) => `/api/branch/${id}`,
    CREATE: '/api/branch',
    UPDATE: (id: string) => `/api/branch/${id}`,
    UPDATE_STATUS: (id: string) => `/api/branch/${id}/status`,
    ASSIGN_MANAGER: (id: string) => `/api/branch/${id}/manager`,
    REMOVE_MANAGER: (id: string) => `/api/branch/${id}/manager/remove`
  },
  CART: {
    GET: '/api/cart',
    ADD: '/api/cart/add',
    UPDATE: '/api/cart/update',
    REMOVE: (itemId: string) => `/api/cart/remove/${itemId}`,
    CLEAR: '/api/cart/clear'
  },
  ORDER: {
    LIST: '/api/orders',
    DETAIL: (id: string) => `/api/orders/${id}`,
    CREATE: '/api/orders',
    CANCEL: (id: string) => `/api/orders/${id}/cancel`
  },
  UPLOAD: {
    IMAGE: '/api/uploads/images',
    MULTIPLE_IMAGES: '/api/uploads/multiple-images',
    IMAGE_DETAIL: (publicId: string) => `/api/uploads/images/${publicId}`
  }
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const

export const APP_CONFIG = {
  ITEMS_PER_PAGE: 12,
  MAX_CART_QUANTITY: 99,
  MIN_CART_QUANTITY: 1,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  OTP_RESEND_COOLDOWN: 60,
  OTP_LENGTH: 6
} as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  SET_PASSWORD: '/set-password',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  AUTH_CALLBACK: '/auth/callback',
  MANAGEMENT: {
    DASHBOARD: '/management/dashboard',
    BRANCHES: '/management/branches',
    INVENTORY_TOTAL: '/management/inventory',
    PROMOTIONS: '/management/promotions',
    PAYMENT_SETTINGS: '/management/payment-settings',
    DELIVERY_SETTINGS: '/management/delivery-settings',
    ALL_REPORTS: '/management/reports',
    USERS: '/management/users',
    STAFF: '/management/staff',
    PRODUCTS: '/management/products',
    CATEGORIES: '/management/categories',
    ORDERS: '/management/orders',
    BRANCH_INVENTORY: '/management/branch-inventory',
    STOCK_REQUESTS: '/management/stock-requests',
    BRANCH_REPORTS: '/management/branch-reports',
    BRANCH_PROMOTIONS: '/management/branch-promotions',
    CUSTOMER_SUPPORT: '/management/customer-support'
  },
  ADMIN: {
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
    CATEGORIES: '/admin/categories'
  }
} as const

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff'
} as const

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.CUSTOMER]: 'Khách hàng',
  [USER_ROLES.ADMIN]: 'Quản trị viên',
  [USER_ROLES.MANAGER]: 'Quản lý chi nhánh',
  [USER_ROLES.STAFF]: 'Nhân viên'
} as const

export const MANAGEMENT_ROLES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.STAFF
]

export const OTP_TYPES = {
  VERIFY_EMAIL: 'verify_email',
  RESET_PASSWORD: 'reset_password',
  CHANGE_PASSWORD: 'change_password',
  CHANGE_EMAIL: 'change_email',
  CHANGE_INFO: 'change_info'
} as const

export type OTPType = (typeof OTP_TYPES)[keyof typeof OTP_TYPES];

export const ERROR_CODES = {
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS'
} as const

export const ORDER_STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  CANCELLED: 'Đã hủy'
} as const

export const PAYMENT_STATUS_LABELS = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
  REFUNDED: 'Đã hoàn tiền'
} as const

export const PAYMENT_METHOD_LABELS = {
  COD: 'Thanh toán khi nhận hàng',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  CREDIT_CARD: 'Thẻ tín dụng',
  E_WALLET: 'Ví điện tử'
} as const
