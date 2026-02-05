import type { Branch } from '@/types/api'

interface BranchCardProps {
  branch: Branch
}

const BranchCard = ({ branch }: BranchCardProps) => {
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    branch.address
  )}`

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{branch.name}</h3>
      <div className="space-y-2 text-gray-700">
        <p className="flex items-start gap-2">
          <span className="mt-0.5">📍</span>
          <span>{branch.address}</span>
        </p>
      </div>
      <a
        href={mapLink}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
      >
        Xem bản đồ
      </a>
    </div>
  )
}

export default BranchCard
