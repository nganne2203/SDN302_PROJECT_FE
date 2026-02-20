import { env } from '@/configs/env'

export const buildGoogleAuthErrorUrl = (error: string | { message?: string }): string => {
  const clientUrl = env.CLIENT_URL || 'http://localhost:5173'
  const errorUrl = new URL(`${clientUrl}/auth/error`)

  const errorMessage = typeof error === 'string' ? error : error?.message || 'Đăng nhập thất bại'
  errorUrl.searchParams.set('error', errorMessage)

  return errorUrl.toString()
}

export const getErrorFromUrl = (searchParams: URLSearchParams): string => {
  return searchParams.get('error') || 'Đăng nhập Google thất bại. Vui lòng thử lại'
}
