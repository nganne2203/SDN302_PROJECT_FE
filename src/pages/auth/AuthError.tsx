import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/constants/constant'
import { toast } from '@/utils/toast'
import { getErrorFromUrl } from '@/utils/googleAuthError'

const AuthError = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const errorMessage = getErrorFromUrl(searchParams)

  useEffect(() => {
    toast.error(errorMessage)
  }, [errorMessage])

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
