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
            Tao yeu cau nhap kho moi
          </Button>
        )}
        <SelectField
          label="Trang thai"
          value={statusFilter}
          onChange={(value) => onStatusChange(value as StockRequestStatus | 'all')}
          options={[
            { label: 'Tat ca trang thai', value: 'all' },
            { label: 'Cho duyet', value: 'pending' },
            { label: 'Da duyet', value: 'approved' },
            { label: 'Bi tu choi', value: 'rejected' }
          ]}
          className="mb-0 min-w-[200px]"
        />
      </Space>
    </Card>
  )
}

export default StockRequestFilters
