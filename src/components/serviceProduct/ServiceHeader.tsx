import { Plus } from 'lucide-react'
import { ButtonCommon } from '../common'

const ServiceProductHeader = ({ onCreate }: { onCreate: () => void }) => {
  return (
    <div className='mb-6 flex justify-between items-center'>
      <div>
        <h1 className='text-3xl font-bold text-gray-800'>Quản lý Dịch vụ Sản phẩm</h1>
        <p className='text-gray-500 mt-1'>Quản lý các dịch vụ đi kèm với sản phẩm</p>
      </div>
      <ButtonCommon
        variant='primary'
        onClick={onCreate}
        icon={<Plus className='w-4 h-4' />}
      >
        Thêm dịch vụ
      </ButtonCommon>
    </div>
  )
}

export default ServiceProductHeader