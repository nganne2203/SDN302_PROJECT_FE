import { ButtonCommon } from '@/components/common'
import { Plus } from 'lucide-react'

interface CategoryHeaderProps {
  onAddClick: () => void
  title?: string
}

const CategoryHeader = ({ onAddClick, title = 'Quản lý danh mục sản phẩm' }: CategoryHeaderProps) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <ButtonCommon
        variant="primary"
        size="lg"
        icon={<Plus className="w-5 h-5" />}
        onClick={onAddClick}
      >
        Thêm danh mục
      </ButtonCommon>
    </div>
  )
}

export default CategoryHeader
