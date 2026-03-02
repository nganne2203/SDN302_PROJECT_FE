import { Card, Space, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { SelectField } from '@/components/common'
import type { StockRequestStatus } from '@/types/api'

/* eslint-disable no-unused-vars */
interface StockRequestFiltersProps {
  isManager: boolean
  statusFilter: StockRequestStatus | 'all'
  onStatusChange: (_value: StockRequestStatus | 'all') => void
  onCreate: () => void
}

const StockRequestFilters = ({
  isManager,
  statusFilter,
  onStatusChange,
  onCreate
}: StockRequestFiltersProps) => {
  return (
    <Card className="mb-6">
      <Space wrap>
        {isManager && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate} size="large">
            Tạo yêu cầu nhập kho mới
          </Button>
        )}
        <SelectField
          label="Trạng thái"
          value={statusFilter}
          onChange={(value) => onStatusChange(value as StockRequestStatus | 'all')}
          options={[
            { label: 'Tất cả trạng thái', value: 'all' },
            { label: 'Chờ duyệt', value: 'pending' },
            { label: 'Đã duyệt', value: 'approved' },
            { label: 'Bị từ chối', value: 'rejected' }
          ]}
          className="mb-0 min-w-[200px]"
        />
      </Space>
    </Card>
  )
}

export default StockRequestFilters
