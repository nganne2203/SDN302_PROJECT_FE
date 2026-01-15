import type { ReactNode } from 'react'

// Common UI Types
export interface BaseProps {
  className?: string
  children?: ReactNode
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface AsyncState<T> extends LoadingState {
  data: T | null
}

// Modal Types
export interface ModalProps extends BaseProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Button Types
export interface ButtonProps extends BaseProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

// Table Types
export interface Column<T> {
  key: keyof T | string
  title: string
  render?: (value: unknown, record: T, index: number) => ReactNode
  width?: number | string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  rowKey: keyof T
  onRowClick?: (record: T) => void
}

// Form Types
export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface FormFieldError {
  message: string
  type: string
}

// Navigation Types
export interface MenuItem {
  key: string
  label: string
  icon?: ReactNode
  path?: string
  children?: MenuItem[]
  permission?: string[]
}

export interface BreadcrumbItem {
  label: string
  path?: string
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
}
