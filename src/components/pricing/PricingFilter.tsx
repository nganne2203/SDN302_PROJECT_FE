/* eslint-disable no-unused-vars */
import { FilterCommon } from '@/components/common'
import type { FilterField } from '@/components/common/FilterCommon'
import type { PricingFilter } from '@/features/pricing/pricingTypes'

interface ProductOption {
  label: string
  value: string
}

interface PricingFilterProps {
  filter: PricingFilter
  onFilterChange: (_key: string, _value: unknown) => void
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onPageChange: (_page: number, _pageSize: number) => void
  onReset: () => void
  productOptions: ProductOption[]
}

const PricingFilterComponent = ({
  filter,
  onFilterChange,
  pagination,
  onPageChange,
  onReset,
  productOptions
}: PricingFilterProps) => {
  const filterFields: FilterField[] = [
    {
      key: 'productId',
      label: 'San pham',
      type: 'select',
      options: productOptions
    },
    {
      key: 'isActive',
      label: 'Trang thai',
      type: 'select',
      options: [
        { label: 'Hoat dong', value: 'true' },
        { label: 'Khong hoat dong', value: 'false' }
      ]
    }
  ]

  return (
    <FilterCommon
      showSearch={false}
      filters={filterFields}
      filterValues={filter as Record<string, unknown>}
      onFilterChange={onFilterChange}
      page={pagination?.page || 1}
      limit={pagination?.limit || 10}
      total={pagination?.total || 0}
      onPageChange={onPageChange}
      showPagination={true}
      onReset={onReset}
      showReset={true}
    />
  )
}

export default PricingFilterComponent
