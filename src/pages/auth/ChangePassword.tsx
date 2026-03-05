import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { toast } from '@/utils/toast'
import { ControlledField, InputField } from '@/components/common'
import ButtonCommon from '@/components/common/ButtonCommon'
import { changePasswordSchema, type ChangePasswordFormData } from '@/utils/validator'
import useAuth from '@/hooks/useAuth'
import { ROUTES } from '@/constants/constant'

const ChangePassword = () => {
  const navigate = useNavigate()
  const { changePassword, isLoading } = useAuth()

  const {
    handleSubmit,
    control,
    reset
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  })

  const onSubmit = useCallback(async (data: ChangePasswordFormData) => {
    if (isLoading) return

    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    })

    if (result.success) {
      toast.success(result.message || 'Đổi mật khẩu thành công!')
      reset()
      navigate(ROUTES.HOME)
    } else {
      toast.error(result.message || 'Không thể đổi mật khẩu')
    }
  }, [isLoading, changePassword, reset, navigate])

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Link>

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đổi mật khẩu</h1>
          <p className="text-gray-500">
            Nhập mật khẩu hiện tại và mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ControlledField
            name="currentPassword"
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <InputField
                label="Mật khẩu hiện tại"
                required
                type="password"
                value={value as string}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                prefix={<Lock className="w-4 h-4 text-gray-400" />}
                placeholder="Nhập mật khẩu hiện tại"
                size="large"
                error={error}
              />
            )}
          />

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
            name="confirmNewPassword"
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <InputField
                label="Xác nhận mật khẩu mới"
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
            Đổi mật khẩu
          </ButtonCommon>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
