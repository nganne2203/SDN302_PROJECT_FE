import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from 'antd'
import { Mail, Lock, User, Phone } from 'lucide-react'
import { toast } from '@/utils/toast'
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
    formState: { errors },
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng Ký</h1>
          <p className="text-gray-500">Tạo tài khoản mới của bạn</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<User className="w-4 h-4 text-gray-400" />}
                  placeholder="Nhập họ và tên"
                  size="large"
                  status={errors.fullName ? 'error' : ''}
                />
              )}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<Mail className="w-4 h-4 text-gray-400" />}
                  placeholder="Nhập email của bạn"
                  size="large"
                  status={errors.email ? 'error' : ''}
                />
              )}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<Phone className="w-4 h-4 text-gray-400" />}
                  placeholder="Nhập số điện thoại"
                  size="large"
                  status={errors.phoneNumber ? 'error' : ''}
                />
              )}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<Lock className="w-4 h-4 text-gray-400" />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                  status={errors.password ? 'error' : ''}
                />
              )}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<Lock className="w-4 h-4 text-gray-400" />}
                  placeholder="Nhập lại mật khẩu"
                  size="large"
                  status={errors.confirmPassword ? 'error' : ''}
                />
              )}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

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
          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="text-gray-700">Đăng ký với Google</span>
          </button>
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
