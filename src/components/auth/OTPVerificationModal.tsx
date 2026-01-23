import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from 'antd'
import type { InputRef } from 'antd'
import { Mail, RefreshCw } from 'lucide-react'
import { ModalCommon } from '@/components/common'
import ButtonCommon from '@/components/common/ButtonCommon'
import useAuth from '@/hooks/useAuth'
import { toast } from '@/utils/toast'
import { APP_CONFIG, OTP_TYPES } from '@/constants/constant'
import type { OTPType } from '@/types/api'

interface OTPVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  type: OTPType
  onSuccess?: () => void
}

const INITIAL_OTP = ['', '', '', '', '', '']

const OTPInputContent = ({
  email,
  type,
  onSuccess,
  onClose,
}: Omit<OTPVerificationModalProps, 'isOpen'>) => {
  const { verifyOTP, resendOTP, isLoading } = useAuth()
  const [otp, setOtp] = useState([...INITIAL_OTP])
  const [countdown, setCountdown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const inputRefs = useRef<(InputRef | null)[]>([])

  useEffect(() => {
    const timer = setTimeout(() => inputRefs.current[0]?.focus(), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (value && !/^\d$/.test(value)) return

      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [otp],
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    },
    [otp],
  )

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData
      .getData('text')
      .slice(0, APP_CONFIG.OTP_LENGTH)

    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData
      .split('')
      .concat(Array(APP_CONFIG.OTP_LENGTH).fill(''))
      .slice(0, APP_CONFIG.OTP_LENGTH)
    setOtp(newOtp)

    const lastIndex = Math.min(pastedData.length - 1, APP_CONFIG.OTP_LENGTH - 1)
    inputRefs.current[lastIndex]?.focus()
  }, [])

  const handleVerify = useCallback(async () => {
    const code = otp.join('')

    if (code.length !== APP_CONFIG.OTP_LENGTH) {
      toast.error('Vui lòng nhập đầy đủ 6 số OTP')
      return
    }

    setIsVerifying(true)
    const result = await verifyOTP({
      email,
      code,
      type,
    })
    setIsVerifying(false)

    if (result.success) {
      toast.success(result.message || 'Xác thực thành công!')
      onSuccess?.()
      onClose()
    } else {
      toast.error(result.message || 'Mã OTP không chính xác hoặc đã hết hạn')
      setOtp([...INITIAL_OTP])
      inputRefs.current[0]?.focus()
    }
  }, [otp, email, type, verifyOTP, onSuccess, onClose])

  const handleResend = useCallback(async () => {
    setIsResending(true)
    const result = await resendOTP({
      email,
      type,
    })
    setIsResending(false)

    if (result.success) {
      toast.success(
        result.message || 'Đã gửi lại mã OTP. Vui lòng kiểm tra email!',
      )
      setCountdown(APP_CONFIG.OTP_RESEND_COOLDOWN)
      setOtp([...INITIAL_OTP])
      inputRefs.current[0]?.focus()
    } else {
      toast.error(result.message || 'Không thể gửi lại OTP. Vui lòng thử lại sau!')
    }
  }, [email, type, resendOTP])

  const getModalContent = () => {
    switch (type) {
      case OTP_TYPES.VERIFY_EMAIL:
        return {
          title: 'Xác Thực Email',
          description: 'Nhập mã 6 số đã được gửi đến',
        }
      case OTP_TYPES.RESET_PASSWORD:
        return {
          title: 'Xác Thực Đặt Lại Mật Khẩu',
          description: 'Nhập mã 6 số đã được gửi đến',
        }
      default:
        return {
          title: 'Xác Thực OTP',
          description: 'Nhập mã 6 số đã được gửi đến',
        }
    }
  }

  const { title, description } = getModalContent()
  const isSubmitting = isLoading || isVerifying

  return (
    <div className="py-4">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
        <p className="text-blue-600 font-semibold">{email}</p>
      </div>

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
              disabled={isSubmitting}
            />
          ))}
        </div>
      </div>

      <ButtonCommon
        type="button"
        variant="primary"
        size="lg"
        onClick={handleVerify}
        isLoading={isSubmitting}
        disabled={isSubmitting}
        block
        className="mb-4"
      >
        Xác Thực
      </ButtonCommon>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Không nhận được mã?</p>
        {countdown > 0 ? (
          <p className="text-sm text-gray-500">Gửi lại sau {countdown}s</p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || isSubmitting}
            className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`}
            />
            Gửi lại mã
          </button>
        )}
      </div>
    </div>
  )
}

const OTPVerificationModal = ({
  isOpen,
  onClose,
  email,
  type,
  onSuccess,
}: OTPVerificationModalProps) => {
  return (
    <ModalCommon isOpen={isOpen} onClose={onClose} size="sm" maskClosable={false}>
      {isOpen && (
        <OTPInputContent
          email={email}
          type={type}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      )}
    </ModalCommon>
  )
}

export default OTPVerificationModal
