import { Input } from 'antd'
import { Mail, RefreshCw } from 'lucide-react'
import { ModalCommon } from '@/components/common'
import ButtonCommon from '@/components/common/ButtonCommon'
import { useOTPVerification } from '@/hooks/useOTPVerification'
import { OTP_TYPES } from '@/constants/constant'
import type { OTPType } from '@/types/api'

interface OTPVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  type: OTPType
  onSuccess?: () => void
}

const OTPInputContent = ({
  email,
  type,
  onSuccess,
  onClose,
}: Omit<OTPVerificationModalProps, 'isOpen'>) => {
  const {
    otp,
    countdown,
    isResending,
    isSubmitting,
    inputRefs,
    handleOtpChange,
    handleKeyDown,
    handlePaste,
    handleVerify,
    handleResend,
  } = useOTPVerification({
    email,
    type,
    onSuccess,
    onClose,
  })

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
