import type { ReactNode } from 'react'

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

export interface ModalProps extends BaseProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

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
  dataIndex?: keyof T | string | string[]
  render?: (value: unknown, record: T, index: number) => ReactNode
  width?: number | string
  sortable?: boolean
  sorter?: boolean | ((a: T, b: T) => number)
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  ellipsis?: boolean
  hidden?: boolean
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  rowKey: keyof T | ((record: T) => string | number)
  onRowClick?: (record: T) => void
  pagination?: boolean
  bordered?: boolean
  size?: 'small' | 'middle' | 'large'
}

// Card Types
export interface CardProps extends BaseProps {
  title?: ReactNode
  subtitle?: string
  extra?: ReactNode
  loading?: boolean
  bordered?: boolean
  hoverable?: boolean
  cover?: ReactNode
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
