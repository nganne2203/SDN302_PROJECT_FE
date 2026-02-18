import { ButtonCommon } from '@/components/common'
import { Plus, Layers } from 'lucide-react'

interface PricingHeaderProps {
  onAddClick: () => void
  onBulkClick: () => void
  title?: string
}

const PricingHeader = ({ onAddClick, onBulkClick, title = 'Quan ly bang gia so luong' }: PricingHeaderProps) => {
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
          Tao bang gia hang loat
        </ButtonCommon>
        <ButtonCommon
          variant="primary"
          size="lg"
          icon={<Plus className="w-5 h-5" />}
          onClick={onAddClick}
        >
          Them bang gia
        </ButtonCommon>
      </div>
    </div>
  )
}

export default PricingHeader
