import { Input, Select, Button, Space, Row, Col, Switch, Checkbox } from 'antd'
import { SearchOutlined, ReloadOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons'
import type { SelectProps } from 'antd'
import type { FilterOption, SortOrder } from '../../types/filter'
import type { ReactNode } from 'react'
import CardCommon from './CardCommon'
import PaginationCommon from './PaginationCommon'

const { Option } = Select

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
}: FilterCommonProps) => {
  const handleSortToggle = () => {
    if (!sortBy) return
    const newOrder: SortOrder = sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? '' : 'asc'
    onSortChange?.(sortBy, newOrder)
  }

  const getSortIcon = () => {
    if (sortOrder === 'asc') return <SortAscendingOutlined />
    if (sortOrder === 'desc') return <SortDescendingOutlined />
    return <SortAscendingOutlined />
  }

  const renderFilterField = (field: FilterField) => {
    const value = filterValues[field.key]

    switch (field.type) {
      case 'select':
        return (
          <Select
            key={field.key}
            placeholder={field.placeholder || `Select ${field.label}`}
            value={value as SelectProps['value']}
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
            checked={value as boolean}
            onChange={(checked) => onFilterChange?.(field.key, checked)}
            defaultChecked={field.defaultChecked}
          />
        )

      case 'checkbox':
      case 'boolean':
        return (
          <Checkbox
            key={field.key}
            checked={value as boolean}
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
      <div className={`filter-common-compact ${className}`}>
        <Space wrap size="middle" style={{ width: '100%', marginBottom: 16 }}>
          {showSearch && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              allowClear
              style={{ width: 250 }}
            />
          )}

          {filters.map((filter) => (
            <div key={filter.key}>
              {renderFilterField(filter)}
            </div>
          ))}

          {showSort && sortOptions.length > 0 && (
            <>
              <Select
                placeholder="Sort by"
                value={sortBy || undefined}
                onChange={(value) => onSortChange?.(value, sortOrder || 'asc')}
                allowClear
                style={{ width: 150 }}
              >
                {sortOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>

              {sortBy && (
                <Button
                  icon={getSortIcon()}
                  onClick={handleSortToggle}
                  type={sortOrder ? 'primary' : 'default'}
                >
                  {sortOrder === 'asc' ? 'Ascending' : sortOrder === 'desc' ? 'Descending' : 'Sort'}
                </Button>
              )}
            </>
          )}

          {showReset && (
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Reset
            </Button>
          )}

          {extra}
        </Space>

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
      </div>
    )
  }

  return (
    <CardCommon className={`filter-common ${className}`} style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        {showSearch && (
          <Col xs={24} sm={12} md={8} lg={6}>
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
          <Col xs={24} sm={12} md={8} lg={6} key={filter.key}>
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
                  onChange={(value) => onSortChange?.(value, sortOrder || 'asc')}
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

            {sortBy && (
              <Col xs={24} sm={12} md={8} lg={6}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    Sort Order
                  </label>
                  <Button
                    icon={getSortIcon()}
                    onClick={handleSortToggle}
                    type={sortOrder ? 'primary' : 'default'}
                    block
                  >
                    {sortOrder === 'asc' ? 'Ascending' : sortOrder === 'desc' ? 'Descending' : 'No Sort'}
                  </Button>
                </div>
              </Col>
            )}
          </>
        )}

        <Col xs={24} sm={24} md={24} lg={24}>
          <Space>
            {showReset && (
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                Reset Filters
              </Button>
            )}
            {extra}
          </Space>
        </Col>
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
