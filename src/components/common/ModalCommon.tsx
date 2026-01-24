import { Modal } from 'antd'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalCommonProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: ModalSize
  children?: ReactNode
  className?: string
  footer?: ReactNode
  closable?: boolean
  maskClosable?: boolean
}

const ModalCommon = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  className = '',
  footer = null,
  closable = true,
  maskClosable = true,
}: ModalCommonProps) => {
  const getWidth = (): number => {
    switch (size) {
      case 'sm':
        return 400
      case 'md':
        return 600
      case 'lg':
        return 800
      case 'xl':
        return 1000
      default:
        return 600
    }
  }

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={title}
      width={getWidth()}
      className={className}
      footer={footer}
      destroyOnHidden
      closable={closable}
      maskClosable={maskClosable}
      closeIcon={<X className="w-5 h-5" />}
    >
      {children}
    </Modal>
  )
}

export default ModalCommon
