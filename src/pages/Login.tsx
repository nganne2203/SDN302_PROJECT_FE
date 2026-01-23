/* eslint-disable react-hooks/refs */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock } from 'lucide-react'
import { toast } from '@/utils/toast'
import { ControlledField, InputField } from '@/components/common'
import ButtonCommon from '@/components/common/ButtonCommon'
import { loginSchema, type LoginFormData } from '@/utils/validator'
import useAuth from '@/hooks/useAuth'
import { Link } from 'react-router-dom'
import { ROUTES, API_ENDPOINTS } from '@/constants/constant'
import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { env } from '@/configs/env'

const Login = () => {
  const { login, isLoading, error } = useAuth()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)

  const {
    handleSubmit,
    control,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
  }

  const handleGoogleLogin = () => {
    window.location.href = `${env.BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`
  }

  const onSubmit = async (data: LoginFormData) => {
    if (isLoading) return

    if (env.RECAPTCHA_SITE_KEY && !recaptchaToken) {
      toast.error('Vui lòng xác minh bạn không phải là robot')
      return
    }
    
    const success = await login({
      ...data,
      captchaToken: recaptchaToken || undefined,
    })
    
    if (success) {
      toast.success('Đăng nhập thành công!')
      recaptchaRef.current?.reset()
      setRecaptchaToken(null)
    } else if (error) {
      toast.error(error)
      recaptchaRef.current?.reset()
      setRecaptchaToken(null)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng Nhập</h1>
          <p className="text-gray-500">Chào mừng bạn quay trở lại!</p>
        </div>

        {/* Login Form */}
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
            <Link to="#" className="text-sm text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
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
            Đăng Nhập
          </ButtonCommon>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Hoặc</span>
          </div>
        </div>

        {/* Social Login */}
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
            <span className="text-gray-700">Đăng nhập với Google</span>
          </button>
        </div>

        {/* Register Link */}
        <p className="mt-8 text-center text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to={ROUTES.REGISTER} className="text-blue-600 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
