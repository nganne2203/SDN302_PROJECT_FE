import { Input, Select, Button, Space, Row, Col, Switch, Checkbox } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { FilterOption, SortOrder } from '../../types/filter'
import type { ReactNode } from 'react'
import CardCommon from './CardCommon'
import PaginationCommon from './PaginationCommon'

const { Option } = Select

/* eslint-disable no-unused-vars */
export interface FilterField {
  key: string
  label: string
  type: 'select' | 'date' | 'dateRange' | 'boolean' | 'checkbox' | 'switch'
  options?: FilterOption[]
  placeholder?: string
  mode?: 'multiple' | 'tags'
  allowClear?: boolean
  defaultChecked?: boolean
}

export interface FilterCommonProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean

  filters?: FilterField[]
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void

  sortOptions?: FilterOption[]
  sortBy?: string
  sortOrder?: SortOrder
  onSortChange?: (field: string, order: SortOrder) => void
  showSort?: boolean

  page?: number
  limit?: number
  total?: number
  onPageChange?: (page: number, pageSize: number) => void
  showPagination?: boolean
  pageSizeOptions?: number[]

  onReset?: () => void
  showReset?: boolean

  className?: string
  extra?: ReactNode
  compact?: boolean
  stackSearchRow?: boolean
  compactFillRow?: boolean
  compactSingleRow?: boolean
  wideSearchInRow?: boolean
}

const FilterCommon = ({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  showSearch = true,

  filters = [],
  filterValues = {},
  onFilterChange,

  sortOptions = [],
  sortBy = '',
  sortOrder = '',
  onSortChange,
  showSort = true,

  page = 1,
  limit = 10,
  total = 0,
  onPageChange,
  showPagination = true,
  pageSizeOptions = [10, 20, 50, 100],

  onReset,
  showReset = true,

  className = '',
  extra,
  compact = false,
  stackSearchRow = false,
  compactFillRow = false,
  compactSingleRow = false,
  wideSearchInRow = false
}: FilterCommonProps) => {
  const renderFilterField = (field: FilterField) => {
    const rawValue = filterValues[field.key]

    switch (field.type) {
    case 'select':
      return (
        <Select
          key={field.key}
          placeholder={field.placeholder || `Select ${field.label}`}
          value={rawValue ?? undefined}
          onChange={(val) => onFilterChange?.(field.key, val)}
          allowClear={field.allowClear ?? true}
          mode={field.mode}
          style={{ width: '100%', minWidth: 150 }}
        >
          {field.options?.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      )

    case 'switch':
      return (
        <Switch
          key={field.key}
          checked={rawValue as boolean}
          onChange={(checked) => onFilterChange?.(field.key, checked)}
          defaultChecked={field.defaultChecked}
        />
      )

    case 'checkbox':
    case 'boolean':
      return (
        <Checkbox
          key={field.key}
          checked={rawValue as boolean}
          onChange={(e) => onFilterChange?.(field.key, e.target.checked)}
          defaultChecked={field.defaultChecked}
        >
          {field.placeholder || field.label}
        </Checkbox>
      )

    default:
      return null
    }
  }

  if (compact) {
    return (
      <CardCommon className={`filter-common-compact ${className}`} style={{ marginBottom: 16 }}>
        <div className={`flex items-center gap-3 w-full ${compactSingleRow ? 'flex-nowrap overflow-x-auto' : 'flex-wrap'}`}>
          {showSearch && (
            <div style={{ flex: compactFillRow ? '2.6 1 380px' : '0 1 auto', minWidth: compactFillRow ? 320 : 220 }}>
              <Input
                placeholder={searchPlaceholder}
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                allowClear
                style={{ width: compactFillRow ? '100%' : 250, minWidth: compactFillRow ? 0 : 220 }}
              />
            </div>
          )}

          {filters.map((filter) => (
            <div
              key={filter.key}
              style={{ flex: compactFillRow ? '1 1 180px' : '0 1 auto', minWidth: 150 }}
            >
              {renderFilterField(filter)}
            </div>
          ))}

          {showSort && sortOptions.length > 0 && (
            <div style={{ flex: compactFillRow ? '1 1 180px' : '0 1 auto', minWidth: 150 }}>
              <Select
                placeholder="Sort by"
                value={sortBy || undefined}
                onChange={(value) => onSortChange?.(value, sortOrder || 'desc')}
                allowClear
                style={{ width: compactFillRow ? '100%' : 150 }}
              >
                {sortOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {showReset && (
            <div style={{ flex: compactFillRow ? '0 1 132px' : '0 1 auto', minWidth: compactFillRow ? 120 : 140 }}>
              <Button icon={<ReloadOutlined />} onClick={onReset} style={{ width: compactFillRow ? 'auto' : undefined }}>
                Làm mới
              </Button>
            </div>
          )}

          {extra && (
            <div style={{ flex: compactFillRow ? '1 1 160px' : '0 1 auto' }}>
              {extra}
            </div>
          )}
        </div>

        {showPagination && total > 0 && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <PaginationCommon
              current={page}
              pageSize={limit}
              total={total}
              onChange={onPageChange}
              showSizeChanger
              pageSizeOptions={pageSizeOptions}
              showTotal
            />
          </div>
        )}
      </CardCommon>
    )
  }

  return (
    <CardCommon className={`filter-common ${className}`} style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        {showSearch && (
          <Col
            xs={24}
            sm={24}
            md={stackSearchRow ? 24 : (wideSearchInRow ? 12 : 8)}
            lg={stackSearchRow ? 24 : (wideSearchInRow ? 10 : 6)}
          >
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Search
              </label>
              <Input
                placeholder={searchPlaceholder}
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                allowClear
              />
            </div>
          </Col>
        )}

        {filters.map((filter) => (
          <Col
            xs={24}
            sm={12}
            md={8}
            lg={wideSearchInRow ? 8 : 6}
            key={filter.key}
          >
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                {filter.label}
              </label>
              {renderFilterField(filter)}
            </div>
          </Col>
        ))}

        {showSort && sortOptions.length > 0 && (
          <>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Sort By
                </label>
                <Select
                  placeholder="Select field"
                  value={sortBy || undefined}
                  onChange={(value) => onSortChange?.(value, sortOrder || 'desc')}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {sortOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
          </>
        )}

        {(showReset || extra) && (
          <Col
            xs={24}
            sm={12}
            md={wideSearchInRow ? 4 : 8}
            lg={6}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
              <Space>
                {showReset && (
                  <Button icon={<ReloadOutlined />} onClick={onReset}>
                    Làm mới
                  </Button>
                )}
                {extra}
              </Space>
            </div>
          </Col>
        )}
      </Row>

      {showPagination && total > 0 && (
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <PaginationCommon
            current={page}
            pageSize={limit}
            total={total}
            onChange={onPageChange}
            showSizeChanger
            pageSizeOptions={pageSizeOptions}
            showTotal
          />
        </div>
      )}
    </CardCommon>
  )
}

export default FilterCommon
