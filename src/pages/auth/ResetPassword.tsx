import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { toast } from '@/utils/toast'
import { ControlledField, InputField } from '@/components/common'
import ButtonCommon from '@/components/common/ButtonCommon'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/utils/validator'
import useAuth from '@/hooks/useAuth'
import { ROUTES } from '@/constants/constant'

interface LocationState {
  email?: string
}

const ResetPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const {
    confirmPasswordReset,
    isLoading,
    pendingEmail
  } = useAuth()

  const email = state?.email || pendingEmail

  useEffect(() => {
    if (!email) {
      toast.error('Vui lòng thực hiện quy trình quên mật khẩu')
      navigate(ROUTES.FORGOT_PASSWORD, { replace: true })
    }
  }, [email, navigate])

  const {
    handleSubmit,
    control
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  })

  const onSubmit = useCallback(async (data: ResetPasswordFormData) => {
    if (isLoading || !email) return

    const result = await confirmPasswordReset({
      email,
      newPassword: data.newPassword
    })

    if (result.success) {
      toast.success(result.message || 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.')
    } else {
      toast.error(result.message || 'Không thể đặt lại mật khẩu')
    }
  }, [isLoading, email, confirmPasswordReset])

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <Link
          to={ROUTES.FORGOT_PASSWORD}
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Link>

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đặt mật khẩu mới</h1>
          <p className="text-gray-500">
            Nhập mật khẩu mới cho tài khoản
          </p>
          <p className="text-blue-600 font-semibold">{email}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ControlledField
            name="newPassword"
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
                placeholder="Nhập mật khẩu mới"
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
                placeholder="Nhập lại mật khẩu mới"
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
            Đặt lại mật khẩu
          </ButtonCommon>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Nhớ mật khẩu?{' '}
          <Link to={ROUTES.LOGIN} className="text-blue-600 font-semibold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
