import { Plus, RefreshCw } from 'lucide-react'
import { ButtonCommon } from '@/components/common'

interface OrderHeaderProps {
  title?: string
  subtitle?: string
  showCreateButton?: boolean
  onCreate?: () => void
  onRefresh?: () => void
  isLoading?: boolean
}

const OrderHeader = ({
  title = 'Quản lý đơn hàng',
  subtitle = 'Quản lý và theo dõi đơn hàng',
  showCreateButton = false,
  onCreate,
  onRefresh,
  isLoading = false
}: OrderHeaderProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-3">
          {onRefresh && (
            <ButtonCommon
              variant="outline"
              size="md"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </ButtonCommon>
          )}
          {showCreateButton && onCreate && (
            <ButtonCommon variant="primary" size="md" onClick={onCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo đơn hàng
            </ButtonCommon>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderHeader
