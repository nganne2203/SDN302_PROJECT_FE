import { useState, useEffect, useRef, useCallback } from 'react'
import type { InputRef } from 'antd'
import useAuth from '@/hooks/useAuth'
import { toast } from '@/utils/toast'
import { APP_CONFIG } from '@/constants/constant'
import type { OTPType } from '@/types/api'

const INITIAL_OTP = ['', '', '', '', '', '']

interface UseOTPVerificationProps {
  email: string
  type: OTPType
  onSuccess?: () => void
  onClose: () => void
}

export const useOTPVerification = ({
  email,
  type,
  onSuccess,
  onClose
}: UseOTPVerificationProps) => {
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
    [otp]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    },
    [otp]
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
      type
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
      type
    })
    setIsResending(false)

    if (result.success) {
      toast.success(
        result.message || 'Đã gửi lại mã OTP. Vui lòng kiểm tra email!'
      )
      setCountdown(APP_CONFIG.OTP_RESEND_COOLDOWN)
      setOtp([...INITIAL_OTP])
      inputRefs.current[0]?.focus()
    } else {
      toast.error(result.message || 'Không thể gửi lại OTP. Vui lòng thử lại sau!')
    }
  }, [email, type, resendOTP])

  const isSubmitting = isLoading || isVerifying

  return {
    otp,
    countdown,
    isResending,
    isSubmitting,
    inputRefs,
    handleOtpChange,
    handleKeyDown,
    handlePaste,
    handleVerify,
    handleResend
  }
}
