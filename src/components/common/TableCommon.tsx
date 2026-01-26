import { Table as AntTable, Empty, Spin } from 'antd'
import type { TableProps as AntTableProps, ColumnType } from 'antd/es/table'
import type { ReactNode, Key } from 'react'

export interface TableColumn<T = Record<string, unknown>> {
  key: string
  title: string
  dataIndex?: keyof T | string | string[]
  render?: (value: unknown, record: T, index: number) => ReactNode
  width?: number | string
  sortable?: boolean
  sorter?: boolean | ((a: T, b: T) => number)
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  ellipsis?: boolean
  filters?: Array<{ text: string; value: string | number | boolean }>
  onFilter?: (value: string | number | boolean, record: T) => boolean
  filterSearch?: boolean
  hidden?: boolean
}

export interface TableCommonProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  rowKey?: keyof T | ((record: T) => Key)
  onRowClick?: (record: T, index?: number) => void
  pagination?: boolean | {
    current?: number
    pageSize?: number
    total?: number
    showSizeChanger?: boolean
    showQuickJumper?: boolean
    showTotal?: (total: number, range: [number, number]) => ReactNode
    pageSizeOptions?: number[]
    onChange?: (page: number, pageSize: number) => void
  }
  bordered?: boolean
  size?: 'small' | 'middle' | 'large'
  scroll?: { x?: number | string; y?: number | string }
  sticky?: boolean
  className?: string
  emptyText?: string
  rowSelection?: AntTableProps<T>['rowSelection']
  expandable?: AntTableProps<T>['expandable']
  showHeader?: boolean
  title?: () => ReactNode
  footer?: () => ReactNode
}

const TableCommon = <T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  rowKey = 'id',
  onRowClick,
  pagination = true,
  bordered = false,
  size = 'middle',
  scroll,
  sticky = false,
  className = '',
  emptyText = 'No data available',
  rowSelection,
  expandable,
  showHeader = true,
  title,
  footer,
}: TableCommonProps<T>) => {
  // Convert custom columns to Ant Design columns
  const antColumns: ColumnType<T>[] = columns
    .filter(col => !col.hidden)
    .map((col): ColumnType<T> => {
      const column: ColumnType<T> = {
        key: col.key,
        title: col.title,
        render: col.render,
        width: col.width,
        sorter: col.sortable ? col.sorter || true : undefined,
        align: col.align,
        fixed: col.fixed,
        ellipsis: col.ellipsis,
        filters: col.filters,
        filterSearch: col.filterSearch,
      }
      
      // Only add dataIndex if it exists
      if (col.dataIndex !== undefined) {
        column.dataIndex = col.dataIndex as never
      }
      
      // Only add onFilter if it exists
      if (col.onFilter !== undefined) {
        column.onFilter = col.onFilter as never
      }
      
      return column
    })

  // Handle row click
  const onRow = onRowClick
    ? (record: T, index?: number) => ({
        onClick: () => onRowClick(record, index),
        style: { cursor: 'pointer' },
      })
    : undefined

  // Configure pagination
  const paginationConfig = typeof pagination === 'boolean' 
    ? (pagination ? {
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number, range: [number, number]) => 
          `${range[0]}-${range[1]} of ${total} items`,
        pageSizeOptions: ['10', '20', '50', '100'],
      } : false)
    : {
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number, range: [number, number]) => 
          `${range[0]}-${range[1]} of ${total} items`,
        pageSizeOptions: ['10', '20', '50', '100'],
        ...pagination,
      }

  return (
    <Spin spinning={loading}>
      <AntTable<T>
        columns={antColumns}
        dataSource={data}
        rowKey={rowKey as string | ((record: T) => Key)}
        onRow={onRow}
        pagination={paginationConfig}
        bordered={bordered}
        size={size}
        scroll={scroll}
        sticky={sticky}
        className={className}
        rowSelection={rowSelection}
        expandable={expandable}
        showHeader={showHeader}
        title={title}
        footer={footer}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyText}
            />
          ),
        }}
      />
    </Spin>
  )
}

export default TableCommon
