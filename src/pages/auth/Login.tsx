import { useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'
import { toast } from '@/utils/toast'
import { ControlledField, InputField } from '@/components/common'
import ButtonCommon from '@/components/common/ButtonCommon'
import OTPVerificationModal from '@/components/auth/OTPVerificationModal'
import { loginSchema, type LoginFormData } from '@/utils/validator'
import useAuth from '@/hooks/useAuth'
import { ROUTES, API_ENDPOINTS, OTP_TYPES } from '@/constants/constant'
import { env } from '@/configs/env'

const Login = () => {
  const isCaptchaEnabled = false
  const {
    login,
    isLoading,
    pendingEmail,
    showOTPModal,
    hideOTPModal,
    isOTPModalOpen
  } = useAuth()

  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [localPendingEmail, setLocalPendingEmail] = useState<string>('')

  const {
    handleSubmit,
    control,
    getValues
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onRecaptchaChange = useCallback((token: string | null) => {
    setRecaptchaToken(token)
  }, [])

  const handleGoogleLogin = useCallback(() => {
    window.location.href = `${env.BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`
  }, [])

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      if (isLoading) return

      const result = await login({
        ...data,
        captchaToken: recaptchaToken || undefined
      })

      recaptchaRef.current?.reset()
      setRecaptchaToken(null)

      if (result.success) {
        toast.success('Đăng nhập thành công!')
      } else if (result.needsVerification) {
        // Email not verified - show OTP modal
        setLocalPendingEmail(data.email)
        showOTPModal(data.email, OTP_TYPES.VERIFY_EMAIL)
        toast.warning(result.message || 'Email chưa được xác minh. Vui lòng xác thực.')
      } else {
        toast.error(result.message || 'Đăng nhập thất bại')
      }
    },
    [isLoading, recaptchaToken, login, showOTPModal]
  )

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      void handleSubmit(onSubmit)(e)
    },
    [handleSubmit, onSubmit]
  )

  const handleOTPSuccess = useCallback(() => {
    toast.success('Xác thực email thành công!')
    hideOTPModal()
  }, [hideOTPModal])

  const emailForOTP = pendingEmail || localPendingEmail || getValues('email')

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng Nhập</h1>
          <p className="text-gray-500">Chào mừng bạn quay trở lại!</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
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

          <ControlledField
            name="password"
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <InputField
                label="Mật khẩu"
                type="password"
                value={value as string}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                prefix={<Lock className="w-4 h-4 text-gray-400" />}
                placeholder="Nhập mật khẩu"
                size="large"
                error={error}
              />
            )}
          />

          <div className="flex items-center justify-end">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-sm text-blue-600 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {isCaptchaEnabled && env.RECAPTCHA_SITE_KEY && (
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={env.RECAPTCHA_SITE_KEY}
                onChange={onRecaptchaChange}
                theme="light"
              />
            </div>
          )}

          <ButtonCommon
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={isLoading}
            block
          >
            Đăng Nhập
          </ButtonCommon>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Hoặc</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors hover:shadow-md"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="text-gray-700">Đăng nhập với Google</span>
          </button>
        </div>

        <p className="mt-8 text-center text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to={ROUTES.REGISTER} className="text-blue-600 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      {emailForOTP && (
        <OTPVerificationModal
          isOpen={isOTPModalOpen}
          onClose={hideOTPModal}
          email={emailForOTP}
          type={OTP_TYPES.VERIFY_EMAIL}
          onSuccess={handleOTPSuccess}
        />
      )}
    </div>
  )
}

export default Login
