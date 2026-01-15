/// <reference types="vite/client" />

export const env = {
  BASE_URL: import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Phone Accessories',
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
} as const