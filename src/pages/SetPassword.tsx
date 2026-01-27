import { useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ControlledField, InputField } from '@/components/common'
import ButtonCommon from '@/components/common/ButtonCommon'
import { setPasswordSchema, type SetPasswordFormData } from '@/utils/validator'
import { ROUTES, STORAGE_KEYS, MANAGEMENT_ROLES } from '@/constants/constant'
import { getStorage, setStorage } from '@/utils/storage'
import { toast } from '@/utils/toast'
import { userApi } from '@/apis/user'
import { useAppDispatch } from '@/apps/hooks'
import { setCredentials } from '@/features/auth/authSlices'
import useAuth from '@/hooks/useAuth'

const SetPassword = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { setPassword, isLoading } = useAuth()

  const accessToken = useMemo(() => getStorage(STORAGE_KEYS.ACCESS_TOKEN), [])
  const refreshToken = useMemo(() => getStorage(STORAGE_KEYS.REFRESH_TOKEN), [])

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      toast.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.')
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [accessToken, refreshToken, navigate])

  const {
    handleSubmit,
    control
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = useCallback(async (data: SetPasswordFormData) => {
    if (isLoading) return

    const result = await setPassword({ password: data.password })

    if (result.success) {
      toast.success(result.message || 'Đặt mật khẩu thành công!')
      setStorage(STORAGE_KEYS.HAS_PASSWORD, 'true')

      try {
        const profileResponse = await userApi.getProfile()
        const user = profileResponse.data
        setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(user))

        dispatch(setCredentials({
          user,
          accessToken: accessToken as string,
          refreshToken: refreshToken as string
        }))

        if (MANAGEMENT_ROLES.includes(user.role)) {
          navigate(ROUTES.MANAGEMENT.DASHBOARD, { replace: true })
        } else {
          navigate(ROUTES.HOME, { replace: true })
        }
      } catch {
        navigate(ROUTES.HOME, { replace: true })
      }
    } else {
      toast.error(result.message || 'Không thể đặt mật khẩu. Vui lòng thử lại.')
    }
  }, [isLoading, setPassword, accessToken, refreshToken, dispatch, navigate])

  if (!accessToken || !refreshToken) {
    return null
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo mật khẩu</h1>
          <p className="text-gray-500">
            Tài khoản Google mới chưa có mật khẩu. Vui lòng tạo mật khẩu để hoàn tất đăng ký.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ControlledField
            name="password"
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <InputField
                label="Mật khẩu mới"
                required
                type="password"
                value={value as string}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                prefix={<Lock className="w-4 h-4 text-gray-400" />}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                size="large"
                error={error}
              />
            )}
          />

          <ControlledField
            name="confirmPassword"
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <InputField
                label="Xác nhận mật khẩu"
                required
                type="password"
                value={value as string}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                prefix={<Lock className="w-4 h-4 text-gray-400" />}
                placeholder="Nhập lại mật khẩu"
                size="large"
                error={error}
              />
            )}
          />

          <ButtonCommon
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={isLoading}
            block
          >
            Lưu mật khẩu & vào hệ thống
          </ButtonCommon>
        </form>
      </div>
    </div>
  )
}

export default SetPassword