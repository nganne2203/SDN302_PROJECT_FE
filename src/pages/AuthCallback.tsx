import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '@/apps/hooks'
import { setCredentials } from '@/features/auth/authSlices'
import { STORAGE_KEYS, ROUTES } from '@/constants/constant'
import { setStorage } from '@/utils/storage'
import { toast } from '@/utils/toast'
import { env } from '@/configs/env'
import type { UserInfo } from '@/types/api'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const hasProcessed = useRef(false)

  const processTokens = (accessToken: string, refreshToken: string, isNewUser: boolean, hasPassword: boolean) => {
    const user = decodeJWT(accessToken)

    if (!user) {
      toast.error('Đăng nhập thất bại: Token không hợp lệ')
      navigate(ROUTES.LOGIN)
      return
    }

    setStorage(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    setStorage(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(user))
    setStorage('hasPassword', String(hasPassword))

    // Update Redux state
    dispatch(setCredentials({
      user,
      accessToken,
      refreshToken,
    }))

    if (isNewUser) {
      toast.success('Đăng ký thành công! Chào mừng bạn đến với cửa hàng!')
    } else {
      toast.success('Đăng nhập thành công!')
    }

    navigate(ROUTES.HOME)
  }

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken')
        const isNewUser = searchParams.get('isNewUser') === 'true'
        const hasPassword = searchParams.get('hasPassword') === 'true'

        console.log('AuthCallback - Current URL:', window.location.href)
        console.log('AuthCallback - Search params:', Object.fromEntries(searchParams.entries()))
        console.log('AuthCallback - All cookies:', document.cookie)

        if (!accessToken) {
          toast.error('Đăng nhập thất bại: Không tìm thấy token')
          navigate(ROUTES.LOGIN)
          return
        }

        let refreshToken: string | null = null
        refreshToken = searchParams.get('refreshToken')
        if (refreshToken) {
          console.log('AuthCallback - Got refreshToken from URL params')
        }

        if (!refreshToken) {
          refreshToken = getCookie('refreshToken')
          if (refreshToken) {
            console.log('AuthCallback - Got refreshToken from cookie')
          }
        }

        if (!refreshToken) {
          console.log('AuthCallback - Trying to get refreshToken via API...')
          try {
            const response = await fetch(`${env.BASE_URL}/auth/me`, {
              method: 'GET',
              credentials: 'include',
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

        if (!refreshToken) {
          console.log('AuthCallback - Using accessToken as refreshToken fallback')
          refreshToken = accessToken
        }

        processTokens(accessToken, refreshToken, isNewUser, hasPassword)
      } catch (error) {
        console.error('OAuth callback error:', error)
        toast.error('Đăng nhập thất bại: Có lỗi xảy ra')
        navigate(ROUTES.LOGIN)
      }
    }

    handleCallback()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate, dispatch])

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center">
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

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

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
