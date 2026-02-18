import { ButtonCommon } from '@/components/common'
import { Plus } from 'lucide-react'

interface DeviceHeaderProps {
  onAddClick: () => void
  title?: string
}

const DeviceHeader = ({ onAddClick, title = 'Quan ly thiet bi' }: DeviceHeaderProps) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <ButtonCommon
        variant="primary"
        size="lg"
        icon={<Plus className="w-5 h-5" />}
        onClick={onAddClick}
      >
        Them thiet bi
      </ButtonCommon>
    </div>
  )
}

export default DeviceHeader
