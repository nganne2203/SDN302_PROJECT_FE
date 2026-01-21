import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '@/apps/hooks'
import { setCredentials } from '@/features/auth/authSlices'
import { STORAGE_KEYS, ROUTES, API_ENDPOINTS } from '@/constants/constant'
import { setStorage } from '@/utils/storage'
import { toast } from '@/utils/toast'
import { env } from '@/configs/env'
import type { UserInfo } from '@/types/api'

/**
 * AuthCallback page - handles Google OAuth callback
 * 
 * Flow:
 * 1. User clicks "Login with Google" -> redirects to backend /api/auth/google
 * 2. Backend redirects to Google OAuth consent screen
 * 3. User selects account and approves
 * 4. Google redirects to backend /api/auth/google/callback
 * 5. Backend processes and redirects to frontend: /auth/callback?accessToken=xxx
 * 6. This page extracts accessToken from URL and refreshToken from cookie/API
 * 7. Save tokens and complete login
 */
const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const hasProcessed = useRef(false) // Prevent double processing

  // Helper function to process tokens and complete login
  const processTokens = (accessToken: string, refreshToken: string, isNewUser: boolean) => {
    // Decode JWT to get user info
    const user = decodeJWT(accessToken)

    if (!user) {
      toast.error('Đăng nhập thất bại: Token không hợp lệ')
      navigate(ROUTES.LOGIN)
      return
    }

    // Save tokens to localStorage
    setStorage(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    setStorage(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(user))

    // Update Redux state
    dispatch(setCredentials({
      user,
      accessToken,
      refreshToken,
    }))

    // Show success message
    if (isNewUser) {
      toast.success('Đăng ký thành công! Chào mừng bạn đến với cửa hàng!')
    } else {
      toast.success('Đăng nhập thành công!')
    }

    // Navigate to home page
    navigate(ROUTES.HOME)
  }

  useEffect(() => {
    // Prevent double processing in React Strict Mode
    if (hasProcessed.current) return
    hasProcessed.current = true

    const handleCallback = async () => {
      try {
        // Get accessToken from URL params
        const accessToken = searchParams.get('accessToken')
        const isNewUser = searchParams.get('isNewUser') === 'true'
        
        // Debug: Log current URL and cookies
        console.log('AuthCallback - Current URL:', window.location.href)
        console.log('AuthCallback - Search params:', Object.fromEntries(searchParams.entries()))
        console.log('AuthCallback - All cookies:', document.cookie)

        if (!accessToken) {
          toast.error('Đăng nhập thất bại: Không tìm thấy token')
          navigate(ROUTES.LOGIN)
          return
        }

        // Try multiple methods to get refreshToken
        let refreshToken: string | null = null

        // Method 1: Try to get from URL params (if backend sends it there)
        refreshToken = searchParams.get('refreshToken')
        if (refreshToken) {
          console.log('AuthCallback - Got refreshToken from URL params')
        }

        // Method 2: Try to read from cookie (if not HttpOnly)
        if (!refreshToken) {
          refreshToken = getCookie('refreshToken')
          if (refreshToken) {
            console.log('AuthCallback - Got refreshToken from cookie')
          }
        }

        // Method 3: Call API to get refreshToken (backend reads HttpOnly cookie)
        if (!refreshToken) {
          console.log('AuthCallback - Trying to get refreshToken via API...')
          try {
            const response = await fetch(`${env.BASE_URL}/auth/me`, {
              method: 'GET',
              credentials: 'include', // Include cookies in request
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            })
            
            if (response.ok) {
              const data = await response.json()
              if (data.data?.refreshToken) {
                refreshToken = data.data.refreshToken
                console.log('AuthCallback - Got refreshToken from API')
              }
            }
          } catch (apiError) {
            console.log('AuthCallback - API method failed:', apiError)
          }
        }

        // Method 4: Use accessToken as refreshToken fallback (if backend uses same token)
        // This is a workaround - not recommended for production
        if (!refreshToken) {
          console.log('AuthCallback - Using accessToken as refreshToken fallback')
          refreshToken = accessToken
        }

        // Process tokens and complete login
        processTokens(accessToken, refreshToken, isNewUser)
      } catch (error) {
        console.error('OAuth callback error:', error)
        toast.error('Đăng nhập thất bại: Có lỗi xảy ra')
        navigate(ROUTES.LOGIN)
      }
    }

    handleCallback()
  }, [searchParams, navigate, dispatch])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <h2 className="text-xl font-semibold text-gray-800">Đang xử lý đăng nhập...</h2>
          <p className="text-gray-500 text-center">
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Helper function to get cookie value
 * Only used for Google OAuth flow where refreshToken is stored in cookie
 */
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

/**
 * Helper function to decode JWT and extract user info
 * Does NOT validate the token - that should be done server-side
 */
function decodeJWT(token: string): UserInfo | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    const payload = JSON.parse(jsonPayload)

    // Map backend JWT payload to UserInfo structure
    return {
      id: payload.id || payload.sub,
      email: payload.email,
      fullName: payload.fullname || payload.fullName || payload.name || payload.email.split('@')[0],
      role: payload.role?.toUpperCase() || 'CUSTOMER',
      phoneNumber: payload.phone || payload.phoneNumber,
      avatar: payload.avatar || payload.picture,
    }
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

export default AuthCallback
