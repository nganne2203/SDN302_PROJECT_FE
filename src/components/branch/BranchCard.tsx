import { EnvironmentOutlined } from '@ant-design/icons'
import type { Branch } from '@/types/api'

interface BranchCardProps {
  branch: Branch
}

const BranchCard = ({ branch }: BranchCardProps) => {
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    branch.address
  )}`

  return (
    <div className="h-full bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 p-6 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 min-h-[56px] line-clamp-2">{branch.name}</h3>
      <div className="text-gray-700 min-h-[72px]">
        <p className="flex items-start gap-2">
          <EnvironmentOutlined className="text-red-500 mt-1 text-base" />
          <span className="line-clamp-2">{branch.address}</span>
        </p>
      </div>
      <a
        href={mapLink}
        target="_blank"
        rel="noreferrer"
        className="mt-auto pt-5 inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
      >
        Xem bản đồ
      </a>
    </div>
  )
}

export default BranchCard
