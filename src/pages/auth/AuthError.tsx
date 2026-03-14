import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES, STORAGE_KEYS, MANAGEMENT_ROLES } from '@/constants/constant'
import { toast } from '@/utils/toast'
import { getErrorFromUrl } from '@/utils/googleAuthError'
import authApi from '@/apis/auth'
import { getStorage, setStorage } from '@/utils/storage'
import { userApi } from '@/apis/user'
import { useAppDispatch } from '@/apps/hooks'
import { setCredentials } from '@/features/auth/authSlices'

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

const AuthError = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const errorMessage = getErrorFromUrl(searchParams)
  const dispatch = useAppDispatch()
  const didTryRecoverRef = useRef(false)

  useEffect(() => {
    toast.error(errorMessage)
  }, [errorMessage])

  useEffect(() => {
    if (didTryRecoverRef.current) return
    didTryRecoverRef.current = true

    // If the backend mistakenly redirected to /auth/error even though it already issued tokens,
    // try to recover the session so the user can continue (and reach Set Password when needed).
    const tryRecover = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const accessTokenFromUrl = searchParams.get('accessToken') || searchParams.get('access_token') || hashParams.get('accessToken') || hashParams.get('access_token')
      const refreshTokenFromUrl = searchParams.get('refreshToken') || searchParams.get('refresh_token') || hashParams.get('refreshToken') || hashParams.get('refresh_token')

      const existingAccessToken = getStorage(STORAGE_KEYS.ACCESS_TOKEN)
      const existingRefreshToken =
        getStorage(STORAGE_KEYS.REFRESH_TOKEN) ||
        getCookie('refreshToken') ||
        getCookie('refresh_token')

      let accessToken = accessTokenFromUrl || existingAccessToken
      let refreshToken = refreshTokenFromUrl || existingRefreshToken

      // Persist tokens found on URL if present.
      if (accessTokenFromUrl) setStorage(STORAGE_KEYS.ACCESS_TOKEN, accessTokenFromUrl)
      if (refreshTokenFromUrl) setStorage(STORAGE_KEYS.REFRESH_TOKEN, refreshTokenFromUrl)

      // If we only have refreshToken (cookie), refresh to get a new accessToken.
      if (!accessToken) {
        if (!refreshToken) return
        try {
          const refreshed = await authApi.refreshToken({ refreshToken })
          accessToken = refreshed.data.accessToken
          refreshToken = refreshed.data.refreshToken

          setStorage(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
          setStorage(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        } catch {
          return
        }
      }

      try {
        const profileResponse = await userApi.getProfile()
        const user = profileResponse.data
        setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(user))

        dispatch(setCredentials({
          user,
          accessToken,
          refreshToken
        }))

        navigate(MANAGEMENT_ROLES.includes(user.role) ? ROUTES.MANAGEMENT.DASHBOARD : ROUTES.HOME, { replace: true })
      } catch {
        // Ignore recovery failures; user can still retry login.
      }
    }

    void tryRecover()
  }, [dispatch, navigate])

  const handleRetry = () => {
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center space-y-4">
          {/* Error Icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Error Title */}
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Đăng nhập thất bại
          </h2>

          {/* Error Message */}
          <p className="text-gray-600 text-center text-sm">
            {errorMessage}
          </p>

          {/* Explanation */}
          <p className="text-gray-500 text-center text-xs">
            Vui lòng kiểm tra lại thông tin tài khoản Google hoặc thử lại
          </p>

          {/* Retry Button */}
          <button
            onClick={handleRetry}
            className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 ease-in-out"
          >
            Quay lại đăng nhập
          </button>

          {/* Back to Home Link */}
          <button
            onClick={() => navigate(ROUTES.HOME, { replace: true })}
            className="w-full px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition duration-200"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthError
