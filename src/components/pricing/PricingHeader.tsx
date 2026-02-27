import { ButtonCommon } from '@/components/common'
import { Plus, Layers } from 'lucide-react'

interface PricingHeaderProps {
  onAddClick: () => void
  onBulkClick: () => void
  title?: string
}

const PricingHeader = ({ onAddClick, onBulkClick, title = 'Quản lý bảng giá số lượng' }: PricingHeaderProps) => {
  return (
    <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="flex gap-2">
        <ButtonCommon
          variant="outline"
          size="lg"
          icon={<Layers className="w-5 h-5" />}
          onClick={onBulkClick}
        >
          Tạo bảng giá hàng loạt
        </ButtonCommon>
        <ButtonCommon
          variant="primary"
          size="lg"
          icon={<Plus className="w-5 h-5" />}
          onClick={onAddClick}
        >
          Thêm bảng giá
        </ButtonCommon>
      </div>
    </div>
  )
}

export default PricingHeader
