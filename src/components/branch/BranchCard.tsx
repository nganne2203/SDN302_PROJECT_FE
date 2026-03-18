import {
  EnvironmentOutlined,
  RightOutlined,
  ShopOutlined,
  UserOutlined
} from '@ant-design/icons'
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
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg ${className}`}
    >
      <div className="flex h-full flex-col">
        <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <ShopOutlined />
          Chi nhánh
        </div>

        <h3 className="text-xl font-semibold leading-snug text-slate-900">
          {branch.name}
        </h3>

        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm ring-1 ring-slate-100">
              <EnvironmentOutlined className="text-base" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Địa chỉ
              </p>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-700">
                {branch.address}
              </p>
            </div>
          </div>
        </div>

        {showManager ? (
          <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                <UserOutlined className="text-base" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
                  Quản lý
                </p>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-700">
                  {branch.manager?.name || 'Đang cập nhật quản lý'}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <a
          href={mapLink}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
        >
          Xem bản đồ
          <RightOutlined className="text-xs transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  )
}

export default BranchCard
