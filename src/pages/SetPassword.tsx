import { useEffect, useMemo, useState } from 'react'
import { Input } from 'antd'
import { Lock } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import ButtonCommon from '@/components/common/ButtonCommon'
import { ROUTES, STORAGE_KEYS } from '@/constants/constant'
import { getStorage, setStorage } from '@/utils/storage'
import { toast } from '@/utils/toast'
import authApi from '@/apis/auth'
import { userApi } from '@/apis/user'
import { useAppDispatch } from '@/apps/hooks'
import { setCredentials } from '@/features/auth/authSlices'

type SetPasswordLocationState = {
  isNewUser?: boolean
  hasPassword?: boolean
}

const SetPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const state = (location.state || {}) as SetPasswordLocationState

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const accessToken = useMemo(() => getStorage(STORAGE_KEYS.ACCESS_TOKEN), [])
  const refreshToken = useMemo(() => getStorage(STORAGE_KEYS.REFRESH_TOKEN), [])

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      toast.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.')
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [accessToken, refreshToken, navigate])

  const validate = (): string | null => {
    if (!password) return 'Vui lòng nhập mật khẩu'
    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự'
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) {
      toast.error(err)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authApi.setPassword(password)
      if (!res.success) {
        toast.error(res.message || 'Không thể đặt mật khẩu')
        return
      }

      toast.success(res.message || 'Đặt mật khẩu thành công')
      setStorage('hasPassword', 'true')

      // Fetch profile and finalize login
      const profileResponse = await userApi.getProfile()
      const user = profileResponse.data
      setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(user))

      dispatch(setCredentials({
        user,
        accessToken: accessToken as string,
        refreshToken: refreshToken as string,
      }))

      // New user: redirect to dashboard/home after setting password
      navigate(ROUTES.HOME, { replace: true, state: { ...state } })
    } catch (e) {
      toast.error('Không thể đặt mật khẩu. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo mật khẩu</h1>
          <p className="text-gray-500">
            Tài khoản Google mới chưa có mật khẩu. Vui lòng tạo mật khẩu để hoàn tất đăng ký.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefix={<Lock className="w-4 h-4 text-gray-400" />}
              placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
              size="large"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <Input.Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              prefix={<Lock className="w-4 h-4 text-gray-400" />}
              placeholder="Nhập lại mật khẩu"
              size="large"
              onPressEnter={handleSubmit}
            />
          </div>

          <ButtonCommon
            type="button"
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            block
          >
            Lưu mật khẩu &amp; vào hệ thống
          </ButtonCommon>
        </div>
      </div>
    </div>
  )
}

export default SetPassword

