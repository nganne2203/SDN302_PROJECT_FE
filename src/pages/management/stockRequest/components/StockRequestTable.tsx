import { Card, Table, Tag, Space, Button, Tooltip } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
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
  onApprove: (_record: StockRequestRecord) => void
  onReject: (_record: StockRequestRecord) => void
}

const StockRequestTable = ({
  data,
  loading,
  pagination,
  onPaginationChange,
  isAdmin,
  onApprove,
  onReject
}: StockRequestTableProps) => {
  const columns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: '_id',
      key: 'requestId',
      render: (value: string) => value.slice(-6).toUpperCase()
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
          rejected: 'error'
        }
        const labelMap: Record<string, string> = {
          pending: 'Chờ duyệt',
          approved: 'Đã duyệt',
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
    ...(isAdmin
      ? [
        {
          title: 'Hành động',
          key: 'action',
          render: (_: unknown, record: StockRequestRecord) => (
            <Space size="small">
              {record.status === 'pending' && (
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
      : [])
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
      />
    </Card>
  )
}

export default StockRequestTable
