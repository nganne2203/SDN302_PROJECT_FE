interface UserHeaderProps {
  title?: string
}

const UserHeader = ({ title = 'Quản lý người dùng' }: UserHeaderProps) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <h1 className="text-3xl font-bold">{title}</h1>
    </div>
  )
}

export default UserHeader
