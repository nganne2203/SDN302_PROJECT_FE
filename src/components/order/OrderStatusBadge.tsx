interface OrderStatusBadgeProps {
  status?: string | null
}

const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const getStatusConfig = (status?: string | null) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: {
        label: 'Chờ xác nhận',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      confirmed: {
        label: 'Đã xác nhận',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      shipped: {
        label: 'Đang giao',
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      },
      delivered: {
        label: 'Đã giao',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      canceled: {
        label: 'Đã hủy',
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    }

    const normalized = typeof status === 'string' ? status.toLowerCase() : ''
    return statusMap[normalized] || {
      label: status || 'Không xác định',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const config = getStatusConfig(status)

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  )
}

export default OrderStatusBadge
