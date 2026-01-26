// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  CART: 'cart',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-verification-code',
    PROFILE: '/auth/profile',
    SET_PASSWORD: '/auth/set-password',
    GOOGLE_LOGIN: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
  },
  // User
  USER: {
    // Backend exposes current user profile via /auth/profile
    PROFILE: '/auth/profile',
    // Backend updates current user via /users/me
    UPDATE_PROFILE: '/users/me',
    // Backend changes password via /auth/change-password (requires Bearer)
    CHANGE_PASSWORD: '/auth/change-password',
    ADDRESSES: '/users/addresses',
  },
  // Products
  PRODUCT: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CATEGORIES: '/products/categories',
    SEARCH: '/products/search',
  },
  BRANCH: {
    LIST: '/branch',
    DETAIL: (id: string) => `/branch/${id}`,
    CREATE: '/branch',
    UPDATE: (id: string) => `/branch/${id}`,
    UPDATE_STATUS: (id: string) => `/branch/${id}/status`,
    ASSIGN_MANAGER: (id: string) => `/branch/${id}/manager`,
    REMOVE_MANAGER: (id: string) => `/branch/${id}/manager/remove`,
  },
  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: (itemId: string) => `/cart/remove/${itemId}`,
    CLEAR: '/cart/clear',
  },
  // Orders
  ORDER: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

// App Config
export const APP_CONFIG = {
  ITEMS_PER_PAGE: 12,
  MAX_CART_QUANTITY: 99,
  MIN_CART_QUANTITY: 1,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
} as const

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  SET_PASSWORD: '/set-password',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  PROFILE: '/profile',
  // Admin Routes
  ADMIN: {
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
    CATEGORIES: '/admin/categories',
  },
} as const

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Role Labels
export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.CUSTOMER]: 'Khách hàng',
  [USER_ROLES.ADMIN]: 'Quản trị viên',
  [USER_ROLES.MANAGER]: 'Quản lý',
  [USER_ROLES.STAFF]: 'Nhân viên',
} as const

// Order Status Labels
export const ORDER_STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  CANCELLED: 'Đã hủy',
} as const

// Payment Status Labels
export const PAYMENT_STATUS_LABELS = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
  REFUNDED: 'Đã hoàn tiền',
} as const

// Payment Method Labels
export const PAYMENT_METHOD_LABELS = {
  COD: 'Thanh toán khi nhận hàng',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  CREDIT_CARD: 'Thẻ tín dụng',
  E_WALLET: 'Ví điện tử',
} as const
