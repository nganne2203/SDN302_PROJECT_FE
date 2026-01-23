/* eslint-disable react-hooks/refs */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, User, Phone } from 'lucide-react'
import { toast } from '@/utils/toast'
import { ControlledField, InputField } from '@/components/common'
import ButtonCommon from '@/components/common/ButtonCommon'
import { registerSchema, type RegisterFormData } from '@/utils/validator'
import useAuth from '@/hooks/useAuth'
import { Link } from 'react-router-dom'
import { ROUTES, API_ENDPOINTS } from '@/constants/constant'
import { useState, useRef } from 'react'
import OTPVerificationModal from '@/components/auth/OTPVerificationModal'
import { useNavigate } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'
import { env } from '@/configs/env'

const Register = () => {
  const { register: registerUser, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
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

  const onRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
  }

  const onSubmit = async (data: RegisterFormData) => {
    // Prevent multiple submissions
    if (isLoading) return

    // Validate reCAPTCHA
    if (env.RECAPTCHA_SITE_KEY && !recaptchaToken) {
      toast.error('Vui lòng xác minh bạn không phải là robot')
      return
    }
    
    const success = await registerUser({
      ...data,
      captchaToken: recaptchaToken || undefined,
    })
    
    if (success) {
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.')
      setRegisteredEmail(data.email)
      setIsOTPModalOpen(true)
      // Reset reCAPTCHA
      recaptchaRef.current?.reset()
      setRecaptchaToken(null)
    } else if (error) {
      toast.error(error)
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset()
      setRecaptchaToken(null)
    }
  }

  const handleOTPSuccess = () => {
    // Navigate to login page after successful verification
    navigate(ROUTES.LOGIN)
  }

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${env.BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng Ký</h1>
          <p className="text-gray-500">Tạo tài khoản mới của bạn</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
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

          {/* Email */}
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

          {/* Phone Number */}
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

          {/* Password */}
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

          {/* Confirm Password */}
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

          {/* Terms Agreement */}
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

          {/* reCAPTCHA */}
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

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Hoặc</span>
          </div>
        </div>

        {/* Social Register */}
        <div className="space-y-3">
          <ButtonCommon 
            type='submit'
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

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-600">
          Đã có tài khoản?{' '}
          <Link to={ROUTES.LOGIN} className="text-blue-600 font-semibold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        email={registeredEmail}
        onSuccess={handleOTPSuccess}
      />
    </div>
  )
}

export default Register
