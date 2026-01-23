import { useState, useEffect, useRef } from 'react'
import { Modal, Input } from 'antd'
import type { InputRef } from 'antd'
import { Mail, RefreshCw } from 'lucide-react'
import ButtonCommon from '@/components/common/ButtonCommon'
import useAuth from '@/hooks/useAuth'
import { toast } from '@/utils/toast'

interface OTPVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  onSuccess?: () => void
}

const OTPVerificationModal = ({
  isOpen,
  onClose,
  email,
  onSuccess,
}: OTPVerificationModalProps) => {
  const { verifyOTP, resendOTP, isLoading } = useAuth()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(InputRef | null)[]>([])

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [isOpen])

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
    setOtp(newOtp)

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    
    if (code.length !== 6) {
      toast.error('Vui lòng nhập đầy đủ 6 số OTP')
      return
    }

    const success = await verifyOTP({
      email,
      code,
      type: 'verify_email',
    })

    if (success) {
      toast.success('Xác thực email thành công! Bạn có thể đăng nhập.')
      onSuccess?.()
      onClose()
    } else {
      toast.error('Mã OTP không chính xác hoặc đã hết hạn')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    const success = await resendOTP({
      email,
      type: 'verify_email',
    })

    setIsResending(false)

    if (success) {
      toast.success('Đã gửi lại mã OTP. Vui lòng kiểm tra email!')
      setCountdown(60) // 60 seconds cooldown
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } else {
      toast.error('Không thể gửi lại OTP. Vui lòng thử lại sau!')
    }
  }

  const handleClose = () => {
    setOtp(['', '', '', '', '', ''])
    setCountdown(0)
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={480}
      maskClosable={false}
    >
      <div className="py-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Xác Thực Email
          </h2>
          <p className="text-gray-600">
            Nhập mã 6 số đã được gửi đến
          </p>
          <p className="text-blue-600 font-semibold">{email}</p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength={1}
                className="w-12 h-12 text-center text-xl font-semibold"
                style={{ fontSize: '20px' }}
              />
            ))}
          </div>
        </div>

        {/* Verify Button */}
        <ButtonCommon
          type="button"
          variant="primary"
          size="lg"
          onClick={handleVerify}
          isLoading={isLoading}
          block
          className="mb-4"
        >
          Xác Thực
        </ButtonCommon>

        {/* Resend Button */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Không nhận được mã?
          </p>
          {countdown > 0 ? (
            <p className="text-sm text-gray-500">
              Gửi lại sau {countdown}s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
              Gửi lại mã
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default OTPVerificationModal
