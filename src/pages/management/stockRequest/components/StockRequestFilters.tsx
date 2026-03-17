import { Card } from 'antd'
import { SelectField } from '@/components/common'
import type { StockRequestStatus } from '@/types/api'

/* eslint-disable no-unused-vars */
interface StockRequestFiltersProps {
  statusFilter: StockRequestStatus | 'all'
  onStatusChange: (_value: StockRequestStatus | 'all') => void
}

const StockRequestFilters = ({
  statusFilter,
  onStatusChange
}: StockRequestFiltersProps) => {
  return (
    <Card className="mb-6">
      <div className="w-full max-w-sm">
        <SelectField
          label="Trạng thái"
          value={statusFilter}
          onChange={(value) => onStatusChange(value as StockRequestStatus | 'all')}
          options={[
            { label: 'Tất cả trạng thái', value: 'all' },
            { label: 'Chờ duyệt', value: 'pending' },
            { label: 'Đã duyệt', value: 'approved' },
            { label: 'Duyệt một phần', value: 'partially_approved' },
            { label: 'Bị từ chối', value: 'rejected' }
          ]}
          className="mb-0"
        />
      </div>
    </Card>
  )
}

export default StockRequestFilters
