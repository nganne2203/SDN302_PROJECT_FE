import { ButtonCommon } from '@/components/common'

interface ProductHeaderProps {
  onCreateClick: () => void
}

const ProductHeader = ({ onCreateClick }: ProductHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <p className="text-sm text-gray-600 mt-1">
          Quản lý danh sách sản phẩm và thông tin chi tiết
        </p>
      </div>
      <ButtonCommon
        variant="primary"
        onClick={onCreateClick}
      >
        + Thêm sản phẩm
      </ButtonCommon>
    </div>
  )
}

export default ProductHeader
