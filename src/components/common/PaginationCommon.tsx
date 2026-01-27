import { Pagination as AntPagination } from 'antd'
import type { PaginationProps as AntPaginationProps } from 'antd'
import type { ReactNode } from 'react'

/* eslint-disable no-unused-vars */
export interface PaginationCommonProps {
  current?: number
  pageSize?: number
  total: number
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode)
  pageSizeOptions?: number[]
  disabled?: boolean
  simple?: boolean
  size?: 'small' | 'middle' | 'large'
  responsive?: boolean
  showLessItems?: boolean
  className?: string
  hideOnSinglePage?: boolean
  align?: 'start' | 'center' | 'end'
}

const PaginationCommon = ({
  current = 1,
  pageSize = 10,
  total,
  onChange,
  onShowSizeChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  pageSizeOptions = [10, 20, 50, 100],
  disabled = false,
  simple = false,
  size = 'middle',
  responsive = true,
  showLessItems = false,
  className = '',
  hideOnSinglePage = false,
  align = 'end'
}: PaginationCommonProps) => {
  const defaultShowTotal = (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} of ${total} items`

  const showTotalConfig = typeof showTotal === 'boolean'
    ? (showTotal ? defaultShowTotal : undefined)
    : showTotal

  const paginationProps: AntPaginationProps = {
    current,
    pageSize,
    total,
    onChange,
    onShowSizeChange: onShowSizeChange || onChange,
    showSizeChanger,
    showQuickJumper,
    showTotal: showTotalConfig,
    pageSizeOptions: pageSizeOptions.map(String),
    disabled,
    simple,
    size,
    responsive,
    showLessItems,
    className: `pagination-common ${className}`,
    hideOnSinglePage,
    style: {
      textAlign: align
    }
  }

  return <AntPagination {...paginationProps} />
}

export default PaginationCommon
