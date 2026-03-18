import { Link } from 'react-router-dom'

interface SectionHeaderProps {
  title: string
  viewAllPath?: string
  viewAllLabel?: string
}

const SectionHeader = ({
  title,
  viewAllPath,
  viewAllLabel = 'Xem tất cả →'
}: SectionHeaderProps) => {
  return (
    <div className="mb-4 flex items-center justify-between md:mb-5">
      <h2 className="text-3xl font-bold text-gray-800">
        {title}
      </h2>
      {viewAllPath ? (
        <Link
          to={viewAllPath}
          className="font-semibold text-blue-600 hover:text-blue-800"
        >
          {viewAllLabel}
        </Link>
      ) : null}
    </div>
  )
}

export default SectionHeader
