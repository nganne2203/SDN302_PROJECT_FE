import { Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/constant'
import { ShoppingCart, LogIn, UserPlus } from 'lucide-react'

interface LoginRequiredModalProps {
  isOpen: boolean
  onClose: () => void
}

const LoginRequiredModal = ({ isOpen, onClose }: LoginRequiredModalProps) => {
  const navigate = useNavigate()

  const handleLogin = () => {
    onClose()
    navigate(ROUTES.LOGIN)
  }

  const handleRegister = () => {
    onClose()
    navigate(ROUTES.REGISTER)
  }

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={420}
      closable
    >
      <div className="flex flex-col items-center py-4">
        {/* Icon */}
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="w-8 h-8 text-orange-500" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Bạn chưa đăng nhập
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-center text-sm mb-6 max-w-[300px]">
          Vui lòng đăng nhập hoặc đăng ký tài khoản để thêm sản phẩm vào giỏ hàng
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full px-4">
          <button
            onClick={handleLogin}
            className="flex items-center justify-center gap-2 w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Đăng nhập
          </button>
          <button
            onClick={handleRegister}
            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-500 hover:text-black transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Đăng ký tài khoản mới
          </button>
        </div>

        {/* Dismiss */}
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Để sau
        </button>
      </div>
    </Modal>
  )
}

export default LoginRequiredModal
