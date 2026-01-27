import { ButtonCommon } from '@/components/common'
import { Plus } from 'lucide-react'

interface UserHeaderProps {
  title?: string
  onCreateUser?: () => void
}

const UserHeader = ({ title = 'Quản lý người dùng', onCreateUser }: UserHeaderProps) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      {onCreateUser && (
        <ButtonCommon
          variant="primary"
          onClick={onCreateUser}
          icon={<Plus className="w-4 h-4" />}
        >
          Thêm người dùng
        </ButtonCommon>
      )}
    </div>
  )
}

export default UserHeader
