import { useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, User, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'
import { toast } from '@/utils/toast'
import { ControlledField, InputField } from '@/components/common'
import ButtonCommon from '@/components/common/ButtonCommon'
import OTPVerificationModal from '@/components/auth/OTPVerificationModal'
import { registerSchema, type RegisterFormData } from '@/utils/validator'
import useAuth from '@/hooks/useAuth'
import { ROUTES, API_ENDPOINTS, OTP_TYPES } from '@/constants/constant'
import { env } from '@/configs/env'

const Register = () => {
  const { 
    register: registerUser, 
    isLoading,
    pendingEmail,
    isOTPModalOpen,
    hideOTPModal,
  } = useAuth()
  
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)

  const {
    handleSubmit,
    control,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: '',
    },
  })

  const onRecaptchaChange = useCallback((token: string | null) => {
    setRecaptchaToken(token)
  }, [])

  const handleGoogleLogin = useCallback(() => {
    window.location.href = `${env.BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`
  }, [])

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      if (isLoading) return

      if (env.RECAPTCHA_SITE_KEY && !recaptchaToken) {
        toast.error('Vui lòng xác minh bạn không phải là robot')
        return
      }

      const result = await registerUser({
        ...data,
        captchaToken: recaptchaToken || undefined,
      })

      recaptchaRef.current?.reset()
      setRecaptchaToken(null)

      if (result.success) {
        toast.success(
          result.message ||
            'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
        )
      } else {
        toast.error(result.message || 'Đăng ký thất bại')
      }
    },
    [isLoading, recaptchaToken, registerUser],
  )

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      void handleSubmit(onSubmit)(e)
    },
    [handleSubmit, onSubmit],
  )

  const handleOTPSuccess = useCallback(() => {
    toast.success('Xác thực email thành công!')
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng Ký</h1>
          <p className="text-gray-500">Tạo tài khoản mới của bạn</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          <ControlledField
            name="fullName"
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <InputField
                label="Họ và tên"
                required
                value={value as string}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                prefix={<User className="w-4 h-4 text-gray-400" />}
                placeholder="Nhập họ và tên"
                size="large"
                error={error}
              />
            )}
          />

          <ControlledField
            name="email"
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <InputField
                label="Email"
                required
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
            name="phoneNumber"
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <InputField
                label="Số điện thoại"
                type="tel"
                value={value as string}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                prefix={<Phone className="w-4 h-4 text-gray-400" />}
                placeholder="Nhập số điện thoại"
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
                required
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

          <div className="flex items-start">
            <input
              type="checkbox"
              className="mt-1 rounded border-gray-300"
              id="terms"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              Tôi đồng ý với{' '}
              <Link to="#" className="text-blue-600 hover:underline">
                Điều khoản dịch vụ
              </Link>{' '}
              và{' '}
              <Link to="#" className="text-blue-600 hover:underline">
                Chính sách bảo mật
              </Link>
            </label>
          </div>

          {env.RECAPTCHA_SITE_KEY && (
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
            Đăng Ký
          </ButtonCommon>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Hoặc</span>
          </div>
        </div>

        <div className="space-y-3">
          <ButtonCommon 
            type='button'
            variant="outline"
            size="lg"
            onClick={handleGoogleLogin}
            block
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="text-gray-700">Đăng ký với Google</span>
          </ButtonCommon>
        </div>

        <p className="mt-6 text-center text-gray-600">
          Đã có tài khoản?{' '}
          <Link to={ROUTES.LOGIN} className="text-blue-600 font-semibold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>

      {pendingEmail && (
        <OTPVerificationModal
          isOpen={isOTPModalOpen}
          onClose={hideOTPModal}
          email={pendingEmail}
          type={OTP_TYPES.VERIFY_EMAIL}
          onSuccess={handleOTPSuccess}
        />
      )}
    </div>
  )
}

export default Register
