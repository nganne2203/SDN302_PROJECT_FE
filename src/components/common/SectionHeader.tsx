import { useNavigate } from 'react-router-dom'

interface SectionHeaderProps {
  title: string
}

const SectionHeader = ({ title }: SectionHeaderProps) => {
  const navigate = useNavigate()

  return (
    <div className="flex justify-between items-center mb-12">
      <h2 className="text-3xl font-bold text-gray-800">
        {title}
      </h2>
      <button
        onClick={() => navigate('/products')}
        className="text-blue-600 hover:text-blue-800 font-semibold"
      >
        Xem tất cả →
      </button>
    </div>
  )
}

export default SectionHeader
