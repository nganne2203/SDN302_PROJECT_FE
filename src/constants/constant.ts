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
    LOGIN: '/api/v1/auth/login',
    LOGIN_NO_CAPTCHA: '/api/v1/auth/login/no-captcha',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    LOGOUT_ALL: '/api/v1/auth/logout-all',
    REFRESH_TOKEN: '/api/v1/auth/refresh-token',
    VERIFY_OTP: '/api/v1/auth/verify-otp',
    RESEND_OTP: '/api/v1/auth/resend-verification-code',
    GOOGLE_LOGIN: '/api/v1/auth/google',
    GOOGLE_CALLBACK: '/api/v1/auth/google/callback'
  },
  USER: {
    ALL_USERS: '/api/v1/users',
    CREATE_USER: '/api/v1/users',
    GET_MANAGER: '/api/v1/users/manager',
    GET_STAFF: '/api/v1/users/staff',
    GET_CUSTOMERS: '/api/v1/users/customers',
    PROFILE: '/api/v1/users/profile',
    UPDATE_PROFILE: '/api/v1/users/me',
    DETAIL: (id: string) => `/api/v1/users/${id}`,
    UPDATE: (id: string) => `/api/v1/users/${id}`,
    UPDATE_STATUS: (id: string) => `/api/v1/users/${id}/status`,
    CHANGE_PASSWORD: '/api/v1/users/change-password',
    SET_PASSWORD: '/api/v1/users/set-password',
    RESET_PASSWORD: '/api/v1/users/reset-password',
    CONFIRM_RESET_PASSWORD: '/api/v1/users/confirm-reset-password'
  },
  PRODUCT: {
    LIST: '/api/v1/products',
    ALL: '/api/v1/products/all',
    CREATE: '/api/v1/products',
    DETAIL: (id: string) => `/api/v1/products/${id}`,
    UPDATE: (id: string) => `/api/v1/products/${id}`,
    DELETE: (id: string) => `/api/v1/products/${id}`,
    UPDATE_STATUS: (id: string) => `/api/v1/products/${id}/status`,
    WITH_STOCK: '/api/v1/products/with-stock',
    FEATURED: '/api/v1/products/featured',
    NEW_ARRIVALS: '/api/v1/products/new-arrivals',
    SEARCH: '/api/v1/products/search',
    BY_DEVICE: (deviceId: string) => `/api/v1/products/by-device/${deviceId}`,
    BY_SLUG: (slug: string) => `/api/v1/products/slug/${slug}`,
    CATEGORIES: '/api/v1/products/categories',
    FOR_ORDER: (id: string) => `/api/v1/products/${id}/for-order`,
    RELATED: (id: string) => `/api/v1/products/${id}/related`
  },
  CATEGORY: {
    LIST: '/api/v1/categories',
    CREATE: '/api/v1/categories',
    DETAIL: (id: string) => `/api/v1/categories/${id}`,
    UPDATE: (id: string) => `/api/v1/categories/${id}`,
    DELETE: (id: string) => `/api/v1/categories/${id}`,
    UPDATE_STATUS: (id: string) => `/api/v1/categories/${id}/status`
  },
  BRANCH: {
    LIST: '/api/v1/branches',
    ALL: '/api/v1/branches/all',
    CREATE: '/api/v1/branches',
    MANAGERS: '/api/v1/branches/managers',
    DETAIL: (id: string) => `/api/v1/branches/${id}`,
    UPDATE: (id: string) => `/api/v1/branches/${id}`,
    DELETE: (id: string) => `/api/v1/branches/${id}`,
    ASSIGN_MANAGER: (id: string) => `/api/v1/branches/${id}/manager`,
    REMOVE_MANAGER: (id: string) => `/api/v1/branches/${id}/manager/remove`,
    UPDATE_STATUS: (id: string) => `/api/v1/branches/${id}/status`
  },
  DEVICE: {
    LIST: '/api/v1/devices',
    CREATE: '/api/v1/devices',
    DETAIL: (id: string) => `/api/v1/devices/${id}`,
    UPDATE: (id: string) => `/api/v1/devices/${id}`,
    DELETE: (id: string) => `/api/v1/devices/${id}`,
    UPDATE_STATUS: (id: string) => `/api/v1/devices/${id}/status`,
    ALL: '/api/v1/devices/all'
  },
  PRICING: {
    LIST: '/api/v1/pricings',
    CREATE: '/api/v1/pricings',
    BY_PRODUCT: (productId: string) => `/api/v1/pricings/product/${productId}`,
    DELETE_BY_PRODUCT: (productId: string) => `/api/v1/pricings/product/${productId}`,
    CALCULATE: (productId: string) => `/api/v1/pricings/calculate/${productId}`,
    DETAIL: (id: string) => `/api/v1/pricings/${id}`,
    UPDATE: (id: string) => `/api/v1/pricings/${id}`,
    DELETE: (id: string) => `/api/v1/pricings/${id}`,
    BULK_CREATE: '/api/v1/pricings/bulk',
    TOGGLE: (id: string) => `/api/v1/pricings/${id}/toggle`
  },
  STATISTICS: {
    DASHBOARD: '/api/v1/statistics/dashboard',
    REVENUE: '/api/v1/statistics/revenue',
    ORDERS: '/api/v1/statistics/orders',
    PRODUCTS: '/api/v1/statistics/products',
    BRANCHES: '/api/v1/statistics/branches',
    BRANCH_PERFORMANCE: '/api/v1/statistics/branches/performance',
    CUSTOMERS: '/api/v1/statistics/customers',
    PAYMENTS: '/api/v1/statistics/payments',
    INVENTORY: '/api/v1/statistics/inventory',
    COMPARISON: '/api/v1/statistics/comparison',
    RECENT_ORDERS: '/api/v1/statistics/recent-orders',
    ORDER_STATUS_SUMMARY: '/api/v1/statistics/order-status-summary'
  },
  CART: {
    LIST: '/api/v1/carts',
    ADD: '/api/v1/carts',
    CLEAR: '/api/v1/carts/clear',
    VALIDATE: '/api/v1/carts/validate-before-checkout',
    REMOVE_ITEM: '/api/v1/carts/item',
    UPDATE_QUANTITY: '/api/v1/carts/item/quantity',
    UPDATE_SERVICES: '/api/v1/carts/item/services'
  },
  INVENTORY: {
    CREATE: '/api/v1/inventories',
    LIST: '/api/v1/inventories',
    LOW_STOCK: '/api/v1/inventories/low-stock',
    UPDATE: (inventoryId: string) => `/api/v1/inventories/${inventoryId}`,
    BY_PRODUCT: (productId: string) => `/api/v1/inventories/product/${productId}`,
    ADJUST: (productId: string) => `/api/v1/inventories/product/${productId}/adjust`
  },
  ORDER: {
    CREATE: '/api/v1/orders',
    CHECKOUT_PREVIEW: '/api/v1/orders/checkout-preview',
    OFFLINE: '/api/v1/orders/offline',
    MY_ORDERS: '/api/v1/orders/my-orders',
    STATISTICS: '/api/v1/orders/statistics',
    ALL: '/api/v1/orders/all',
    BY_ORDER_NUMBER: (orderNumber: string) => `/api/v1/orders/order-number/${orderNumber}`,
    DETAIL: (orderId: string) => `/api/v1/orders/${orderId}`,
    UPDATE_STATUS: (orderId: string) => `/api/v1/orders/${orderId}/status`,
    CANCEL: (orderId: string) => `/api/v1/orders/${orderId}/cancel`,
    UPDATE_DELIVERY: (orderId: string) => `/api/v1/orders/${orderId}/delivery`,
    SHIPPING_FEE: (orderId: string) => `/api/v1/orders/${orderId}/shipping-fee`
  },
  PAYMENT: {
    BANKS: '/api/v1/payments/banks',
    VNPAY_RETURN: '/api/v1/payments/vnpay-return',
    VNPAY_IPN: '/api/v1/payments/vnpay-ipn',
    VNPAY_CREATE: '/api/v1/payments/vnpay/create',
    MY_PAYMENTS: '/api/v1/payments/my-payments',
    STATUS: (orderNumber: string) => `/api/v1/payments/status/${orderNumber}`,
    CHECK: (orderNumber: string) => `/api/v1/payments/check/${orderNumber}`,
    BY_ORDER: (orderId: string) => `/api/v1/payments/order/${orderId}`,
    CANCEL: (orderId: string) => `/api/v1/payments/${orderId}/cancel`
  },
  REVIEW: {
    CREATE: '/api/v1/reviews',
    LIST: '/api/v1/reviews',
    MY_REVIEWS: '/api/v1/reviews/my-reviews',
    BY_PRODUCT: (productId: string) => `/api/v1/reviews/product/${productId}`,
    PRODUCT_STATS: (productId: string) => `/api/v1/reviews/product/${productId}/stats`,
    CAN_REVIEW: (productId: string) => `/api/v1/reviews/product/${productId}/can-review`,
    DETAIL: (id: string) => `/api/v1/reviews/${id}`,
    UPDATE: (id: string) => `/api/v1/reviews/${id}`,
    DELETE: (id: string) => `/api/v1/reviews/${id}`
  },
  SERVICE: {
    CREATE: '/api/v1/services',
    LIST: '/api/v1/services',
    DETAIL: (id: string) => `/api/v1/services/${id}`,
    UPDATE: (id: string) => `/api/v1/services/${id}`,
    DELETE: (id: string) => `/api/v1/services/${id}`,
    UPDATE_STATUS: (id: string) => `/api/v1/services/${id}/status`,
    BY_PRODUCT: (productId: string) => `/api/v1/services/product/${productId}`
  },
  STOCK_REQUEST: {
    CREATE: '/api/v1/stock-requests',
    LIST: '/api/v1/stock-requests',
    PENDING: '/api/v1/stock-requests/pending',
    BY_BRANCH: (branchId: string) => `/api/v1/stock-requests/branch/${branchId}`,
    DETAIL: (requestId: string) => `/api/v1/stock-requests/${requestId}`,
    APPROVE: (requestId: string) => `/api/v1/stock-requests/${requestId}/approve`,
    REJECT: (requestId: string) => `/api/v1/stock-requests/${requestId}/reject`
  },
  STORE_INVENTORY: {
    CREATE: '/api/v1/store-inventories',
    BY_BRANCH: (branchId: string) => `/api/v1/store-inventories/${branchId}`,
    OUT_OF_STOCK: (branchId: string) => `/api/v1/store-inventories/${branchId}/out-of-stock`,
    LOW_STOCK: (branchId: string) => `/api/v1/store-inventories/${branchId}/low-stock`,
    NEED_RESTOCK: (branchId: string) => `/api/v1/store-inventories/${branchId}/need-restock`,
    OVERSTOCK: (branchId: string) => `/api/v1/store-inventories/${branchId}/overstock`,
    UPDATE_THRESHOLDS: (branchId: string, productId: string) => `/api/v1/store-inventories/${branchId}/${productId}/thresholds`,
    BY_PRODUCT: (branchId: string, productId: string) => `/api/v1/store-inventories/${branchId}/${productId}`,
    DELETE: (inventoryId: string) => `/api/v1/store-inventories/${inventoryId}`
  },
  UPLOAD: {
    IMAGE: '/api/v1/uploads/images',
    MULTIPLE_IMAGES: '/api/v1/uploads/multiple-images',
    IMAGE_DETAIL: (publicId: string) => `/api/v1/uploads/images/${publicId}`,
    DELETE_IMAGE: (publicId: string) => `/api/v1/uploads/images/${publicId}`
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
  CHANGE_PASSWORD: '/change-password',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PRODUCTS: '/products',
  BRANCHES: '/branches',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PAYMENT_RESULT: '/payment-result',
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_FAILED: '/payment/failed',
  PAYMENT_ERROR: '/payment/error',
  ORDERS: '/orders',
  MY_REVIEWS: '/my-reviews',
  ORDER_DETAIL: '/orders/:id',
  AUTH_CALLBACK: '/auth/callback',
  AUTH_ERROR: '/auth/error',
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
    PRICINGS: '/management/pricings',
    CATEGORIES: '/management/categories',
    DEVICES: '/management/devices',
    ORDERS: '/management/orders',
    BRANCH_INVENTORY: '/management/branch-inventory',
    STOCK_REQUESTS: '/management/stock-requests',
    BRANCH_REPORTS: '/management/branch-reports',
    REVIEWS: '/management/reviews',
    BRANCH_PROMOTIONS: '/management/branch-promotions',
    CUSTOMER_SUPPORT: '/management/customer-support',
    SERVICES: '/management/services',
    MANAGER_USERS: '/management/manager-users',
    STAFF_CUSTOMERS: '/management/staff-customers'
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
  pending: 'Chưa thanh toán',
  success: 'Đã thanh toán',
  failed: 'Thanh toán thất bại',
  refunded: 'Đã hoàn tiền',
  canceled: 'Đã hủy thanh toán',
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

export const SERVICE_PRODUCT_TYPE_LABELS = {
  engraving: 'Khắc',
  printing: 'In ảnh',
  drilling: 'Đục lỗ',
  cutting: 'Cắt',
  embossing: 'Nổi chữ',
  coating: 'Phủ',
  lamination: 'Dán bìa',
  other: 'Khác'
} as const

export const SERVICE_PRODUCT_TYPE_COLORS: Record<string, string> = {
  engraving: 'bg-amber-50 text-amber-700 border-amber-200',
  printing: 'bg-blue-50 text-blue-700 border-blue-200',
  drilling: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  cutting: 'bg-red-50 text-red-700 border-red-200',
  embossing: 'bg-purple-50 text-purple-700 border-purple-200',
  coating: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lamination: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  other: 'bg-gray-50 text-gray-700 border-gray-200'
}

export const getServiceProductTypeLabel = (type: string) =>
  SERVICE_PRODUCT_TYPE_LABELS[type as keyof typeof SERVICE_PRODUCT_TYPE_LABELS] ?? type

export const SERVICE_PRODUCT_TYPE = Object.entries(SERVICE_PRODUCT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}))
