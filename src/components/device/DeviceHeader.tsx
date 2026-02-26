import { ButtonCommon } from '@/components/common'
import { Plus } from 'lucide-react'

interface DeviceHeaderProps {
  onAddClick: () => void
  title?: string
}

const DeviceHeader = ({ onAddClick, title = 'Quản lý thiết bị' }: DeviceHeaderProps) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <ButtonCommon
        variant="primary"
        size="lg"
        icon={<Plus className="w-5 h-5" />}
        onClick={onAddClick}
      >
        Thêm thiết bị
      </ButtonCommon>
    </div>
  )
}

export default DeviceHeader
