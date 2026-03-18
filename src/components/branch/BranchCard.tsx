import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons'
import type { Branch } from '@/types/api'

interface BranchCardProps {
  branch: Branch
  className?: string
  showManager?: boolean
}

const BranchCard = ({
  branch,
  className = '',
  showManager = false
}: BranchCardProps) => {
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${branch.name} ${branch.address}`
  )}`

  return (
    <div className={`flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg ${className}`}>
      <h3 className="mb-3 min-h-[56px] line-clamp-2 text-lg font-semibold text-gray-900">
        {branch.name}
      </h3>

      <div className="min-h-[72px] text-gray-700">
        <p className="flex items-start gap-2">
          <EnvironmentOutlined className="mt-1 text-base text-red-500" />
          <span className="line-clamp-2">{branch.address}</span>
        </p>
      </div>

      {showManager ? (
        <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <UserOutlined className="text-slate-500" />
            <span className="line-clamp-1">
              {branch.manager?.name ? `Quản lý: ${branch.manager.name}` : 'Đang cập nhật quản lý'}
            </span>
          </p>
        </div>
      ) : null}

      <a
        href={mapLink}
        target="_blank"
        rel="noreferrer"
        className="mt-auto inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 pt-5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
      >
        Xem bản đồ
      </a>
    </div>
  )
}

export default BranchCard
