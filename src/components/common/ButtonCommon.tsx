import { Button } from 'antd'
import type { ButtonProps as AntButtonProps } from 'antd'
import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonCommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  children?: ReactNode
  className?: string
  icon?: ReactNode
  block?: boolean
}

const ButtonCommon = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
  className = '',
  icon,
  block = false,
}: ButtonCommonProps) => {
  const getAntType = (): AntButtonProps['type'] => {
    switch (variant) {
      case 'primary':
        return 'primary'
      case 'secondary':
        return 'default'
      case 'danger':
        return 'primary'
      case 'outline':
        return 'default'
      case 'ghost':
        return 'text'
      default:
        return 'primary'
    }
  }

  const getSize = (): AntButtonProps['size'] => {
    switch (size) {
      case 'sm':
        return 'small'
      case 'md':
        return 'middle'
      case 'lg':
        return 'large'
      default:
        return 'middle'
    }
  }

  return (
    <Button
      type={getAntType()}
      size={getSize()}
      loading={isLoading}
      disabled={disabled}
      htmlType={type}
      onClick={onClick}
      danger={variant === 'danger'}
      ghost={variant === 'outline'}
      className={className}
      icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      block={block}
    >
      {children}
    </Button>
  )
}

export default ButtonCommon
