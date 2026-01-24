import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from '@/utils/toast'
import { ControlledField, InputField } from '@/components/common'
import ButtonCommon from '@/components/common/ButtonCommon'
import OTPVerificationModal from '@/components/auth/OTPVerificationModal'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/utils/validator'
import useAuth from '@/hooks/useAuth'
import { ROUTES, OTP_TYPES } from '@/constants/constant'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const { 
    requestPasswordReset, 
    isLoading,
    pendingEmail,
    isOTPModalOpen,
    hideOTPModal,
  } = useAuth()
  
  const [localEmail, setLocalEmail] = useState('')

  const {
    handleSubmit,
    control,
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = useCallback(async (data: ForgotPasswordFormData) => {
    if (isLoading) return
    
    setLocalEmail(data.email)
    const result = await requestPasswordReset({ email: data.email })
    
    if (result.success) {
      toast.success(result.message || 'Mã xác thực đã được gửi đến email của bạn')
    } else {
      toast.error(result.message || 'Không thể gửi mã xác thực')
    }
  }, [isLoading, requestPasswordReset])

  const handleOTPSuccess = useCallback(() => {
    const email = pendingEmail || localEmail || getValues('email')
    toast.success('Xác thực thành công! Vui lòng đặt mật khẩu mới.')
    navigate(ROUTES.RESET_PASSWORD, { state: { email } })
  }, [pendingEmail, localEmail, getValues, navigate])

  const emailForOTP = pendingEmail || localEmail || getValues('email')

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <Link 
          to={ROUTES.LOGIN} 
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại đăng nhập
        </Link>

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quên mật khẩu?</h1>
          <p className="text-gray-500">
            Nhập email của bạn và chúng tôi sẽ gửi mã xác thực để đặt lại mật khẩu.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ControlledField
            name="email"
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <InputField
                label="Email"
                type="email"
                value={value as string}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                prefix={<Mail className="w-4 h-4 text-gray-400" />}
                placeholder="Nhập email của bạn"
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
            Gửi mã xác thực
          </ButtonCommon>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Nhớ mật khẩu?{' '}
          <Link to={ROUTES.LOGIN} className="text-blue-600 font-semibold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>

      {emailForOTP && (
        <OTPVerificationModal
          isOpen={isOTPModalOpen}
          onClose={hideOTPModal}
          email={emailForOTP}
          type={OTP_TYPES.RESET_PASSWORD}
          onSuccess={handleOTPSuccess}
        />
      )}
    </div>
  )
}

export default ForgotPassword
