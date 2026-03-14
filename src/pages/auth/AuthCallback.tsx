import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '@/apps/hooks'
import { setCredentials } from '@/features/auth/authSlices'
import { STORAGE_KEYS, ROUTES } from '@/constants/constant'
import { setStorage } from '@/utils/storage'
import { toast } from '@/utils/toast'
import { userApi } from '@/apis/user'

/* eslint-disable no-console */
const getParamValue = (
  searchParams: URLSearchParams,
  hashParams: URLSearchParams,
  keys: string[]
): string | null => {
  for (const key of keys) {
    const value = searchParams.get(key) || hashParams.get(key)
    if (value) return value
  }
  return null
}

const parseBooleanParam = (
  searchParams: URLSearchParams,
  hashParams: URLSearchParams,
  keys: string[]
): boolean => {
  const value = getParamValue(searchParams, hashParams, keys)
  if (!value) return false
  return ['true', '1', 'yes'].includes(value.toLowerCase())
}

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const hasProcessed = useRef(false)

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        const accessToken = getParamValue(searchParams, hashParams, ['accessToken', 'access_token'])
        const isNewUser = parseBooleanParam(searchParams, hashParams, ['isNewUser', 'is_new_user'])
        const hasPasswordRaw = getParamValue(searchParams, hashParams, ['hasPassword', 'has_password'])
        const hasPassword = hasPasswordRaw ? ['true', '1', 'yes'].includes(hasPasswordRaw.toLowerCase()) : false

        if (!accessToken) {
          toast.error('Đăng nhập thất bại: Không tìm thấy token')
          navigate(ROUTES.LOGIN)
          return
        }

        let refreshToken = getCookie('refreshToken') || getCookie('refresh_token')
        if (!refreshToken) {
          refreshToken = getParamValue(searchParams, hashParams, ['refreshToken', 'refresh_token'])
        }

        if (!refreshToken) {
          toast.error('Đăng nhập thất bại: Không tìm thấy refreshToken')
          navigate(ROUTES.LOGIN)
          return
        }

        setStorage(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
        setStorage(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        // Only persist hasPassword if backend explicitly provides it.
        if (hasPasswordRaw !== null) {
          setStorage(STORAGE_KEYS.HAS_PASSWORD, String(hasPassword))
        }

        // Do not force Set Password here unless backend explicitly flags this as needed.
        // (Some environments don't require password setup for Google login users.)
        if (isNewUser && hasPasswordRaw !== null && !hasPassword) {
          navigate(ROUTES.SET_PASSWORD, { replace: true, state: { isNewUser, hasPassword } })
          return
        }

        const profileResponse = await userApi.getProfile()
        const user = profileResponse.data
        setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(user))

        dispatch(setCredentials({
          user,
          accessToken,
          refreshToken
        }))

        toast.success(isNewUser ? 'Đăng ký thành công! Chào mừng bạn đến với cửa hàng!' : 'Đăng nhập thành công!')
        navigate(ROUTES.HOME, { replace: true })
      } catch (error) {
        console.error('OAuth callback error:', error)
        toast.error('Đăng nhập thất bại: Có lỗi xảy ra')
        navigate(ROUTES.LOGIN)
      }
    }

    handleCallback()
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

export default AuthCallback
