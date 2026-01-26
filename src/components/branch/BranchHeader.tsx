import { ButtonCommon } from '@/components/common'
import { Plus } from 'lucide-react'

interface BranchHeaderProps {
  onAddClick: () => void
  title?: string
  canManage?: boolean
}

const BranchHeader = ({ onAddClick, title = 'Quản lý chi nhánh', canManage = true }: BranchHeaderProps) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      {canManage && (
        <ButtonCommon
          variant="primary"
          size="lg"
          icon={<Plus className="w-5 h-5" />}
          onClick={onAddClick}
        >
          Thêm chi nhánh
        </ButtonCommon>
      )}
    </div>
  )
}

export default BranchHeader

