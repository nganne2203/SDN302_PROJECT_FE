import { Card, Table, Tag, Space, Button, Tooltip, Empty } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import dayjs from 'dayjs'
import type { StockRequestRecord, StockRequestStatus } from '@/types/api'

/* eslint-disable no-unused-vars */
interface StockRequestTableProps {
  data: StockRequestRecord[]
  loading: boolean
  pagination: TablePaginationConfig
  onPaginationChange: (_pagination: TablePaginationConfig) => void
  isAdmin: boolean
  availableInventoryByProduct?: Record<string, number>
  onApprove: (_record: StockRequestRecord) => void
  onReject: (_record: StockRequestRecord) => void
  onViewDetail?: (_record: StockRequestRecord) => void
}

const StockRequestTable = ({
  data,
  loading,
  pagination,
  onPaginationChange,
  isAdmin,
  availableInventoryByProduct = {},
  onApprove,
  onReject,
  onViewDetail
}: StockRequestTableProps) => {
  const columns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: '_id',
      key: 'requestId',
      render: (value: string) => (
        <Button
          type="link"
          size="small"
          className="p-0"
          onClick={() => {
            const record = data.find((r) => r._id === value)
            if (record && onViewDetail) onViewDetail(record)
          }}
        >
          {value.slice(-6).toUpperCase()}
        </Button>
      )
    },
    ...(isAdmin
      ? [
        {
          title: 'Chi nhánh',
          dataIndex: ['branch', 'name'],
          key: 'branch',
          render: (_: string, record: StockRequestRecord) => record.branch?.name || '-'
        }
      ]
      : []),
    {
      title: 'Sản phẩm',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (_: string, record: StockRequestRecord) => record.product?.name || '-'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value: number) => `${value} cái`
    },
    ...(isAdmin
      ? [
        {
          title: 'Tồn kho khả dụng',
          key: 'availableInventory',
          render: (_: unknown, record: StockRequestRecord) => {
            const productId = record.product?._id
            const availableQuantity = productId ? availableInventoryByProduct[productId] : undefined
            return `${availableQuantity ?? 0} cái`
          }
        }
      ]
      : []),
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY')
    },
    {
      title: 'Yêu cầu từ',
      dataIndex: ['requester', 'fullname'],
      key: 'requester',
      render: (_: string, record: StockRequestRecord) => record.requester?.fullname || '-'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: StockRequestStatus) => {
        const colorMap: Record<string, string> = {
          pending: 'warning',
          approved: 'success',
          partially_approved: 'processing',
          rejected: 'error'
        }
        const labelMap: Record<string, string> = {
          pending: 'Chờ duyệt',
          approved: 'Đã duyệt',
          partially_approved: 'Duyệt một phần',
          rejected: 'Bị từ chối'
        }
        return <Tag color={colorMap[status]}>{labelMap[status]}</Tag>
      }
    },
    ...(isAdmin
      ? [
        {
          title: 'Duyệt bởi',
          dataIndex: ['admin', 'fullname'],
          key: 'approvedBy',
          render: (_: string, record: StockRequestRecord) => record.admin?.fullname || '-'
        }
      ]
      : []),
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: StockRequestRecord) => (
        <Space size="small">
          {onViewDetail && (
            <Tooltip title="Chi tiết">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onViewDetail(record)}
              />
            </Tooltip>
          )}
          {isAdmin && record.status === 'pending' && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => onApprove(record)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => onReject(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <Card title="Danh sách yêu cầu nhập kho">
      <Table
        columns={columns}
        dataSource={data}
        pagination={pagination}
        loading={loading}
        onChange={onPaginationChange}
        scroll={{ x: 1200 }}
        size="small"
        rowKey={(record) => record._id}
        locale={{ emptyText: <Empty description="Không có yêu cầu nhập kho nào" /> }}
      />
    </Card>
  )
}

export default StockRequestTable
