import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from 'antd'
import { Mail, Lock } from 'lucide-react'
import { toast } from '@/utils/toast'
import ButtonCommon from '@/components/common/ButtonCommon'
import { loginSchema, type LoginFormData } from '@/utils/validator'
import useAuth from '@/hooks/useAuth'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/constant'

const Login = () => {
  const { login, isLoading, error } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data)
    if (success) {
      toast.success('Đăng nhập thành công!')
    } else if (error) {
      toast.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng Nhập</h1>
          <p className="text-gray-500">Chào mừng bạn quay trở lại!</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              {...register('email')}
              prefix={<Mail className="w-4 h-4 text-gray-400" />}
              placeholder="Nhập email của bạn"
              size="large"
              status={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <Input.Password
              {...register('password')}
              prefix={<Lock className="w-4 h-4 text-gray-400" />}
              placeholder="Nhập mật khẩu"
              size="large"
              status={errors.password ? 'error' : ''}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <Link to="#" className="text-sm text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <ButtonCommon
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
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
          <button className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
