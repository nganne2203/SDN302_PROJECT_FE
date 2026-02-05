/// <reference types='vite/client' />

export const env = {
  BASE_URL: import.meta.env.VITE_BASE_URL || 'http://localhost:3080',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Phone Accessories',
  RECAPTCHA_SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
  CLIENT_URL: import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173',
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV
} as const
