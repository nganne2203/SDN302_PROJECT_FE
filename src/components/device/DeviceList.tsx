import { Button, Space, Popconfirm, Tooltip } from 'antd'
import { Edit, Trash2, Power } from 'lucide-react'
import { TableCommon, LoaderCommon } from '@/components/common'
import type { TableColumn } from '@/components/common/TableCommon'
import type { Device } from '@/features/device/deviceTypes'
import dayjs from 'dayjs'

interface DeviceWithKey extends Record<string, unknown> {
  key: string
  _id: string
  name: string
  type: string
  brand: string
  model: string
  isActive: boolean
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

/* eslint-disable no-unused-vars */
interface DeviceListProps {
  devices: Device[]
  isLoading: boolean
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onEdit: (_device: Device) => void
  onDelete: (_id: string) => void
  onUpdateStatus: (_id: string, _isActive: boolean) => void
  onPageChange: (_page: number, _pageSize: number) => void
}

const DeviceListComponent = ({
  devices,
  isLoading,
  pagination,
  onEdit,
  onDelete,
  onUpdateStatus,
  onPageChange
}: DeviceListProps) => {
  const deviceWithKeys: DeviceWithKey[] = devices.map(device => ({
    ...device,
    key: device._id
  }))

  const tableColumns: TableColumn<DeviceWithKey>[] = [
    {
      key: 'name',
      title: 'Tên thiết bị',
      dataIndex: 'name',
      width: 180,
      sortable: true
    },
    {
      key: 'type',
      title: 'Loại',
      dataIndex: 'type',
      width: 120
    },
    {
      key: 'brand',
      title: 'Thương hiệu',
      dataIndex: 'brand',
      width: 150
    },
    {
      key: 'model',
      title: 'Model',
      dataIndex: 'model',
      width: 160
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 100,
      render: (value: unknown) => {
        const isActive = value as boolean
        return (
          <span className={isActive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
          </span>
        )
      }
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 140,
      sortable: true,
      render: (value: unknown) => {
        if (!value) return '-'
        const dateStr = value as string
        return dayjs(dateStr).format('DD/MM/YYYY HH:mm')
      }
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: DeviceWithKey) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              size="small"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => onEdit(record as unknown as Device)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              size="small"
              icon={<Power className="w-4 h-4" />}
              style={{ color: record.isActive ? '#16a34a' : '#dc2626', borderColor: record.isActive ? '#16a34a' : '#dc2626' }}
              onClick={() => onUpdateStatus(record._id, !record.isActive)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description="ạn có chắc chắn muốn xóa thiết bị này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => onDelete(record._id)}
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button danger size="small" icon={<Trash2 className="w-4 h-4" />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <>
      {isLoading ? (
        <LoaderCommon size="lg" tip="Đang tải thiết bị..." />
      ) : (
        <TableCommon<DeviceWithKey>
          columns={tableColumns}
          data={deviceWithKeys}
          loading={isLoading}
          rowKey="key"
          pagination={{
            current: pagination?.page || 1,
            pageSize: pagination?.limit || 10,
            total: pagination?.total || 0,
            onChange: (page, pageSize) => onPageChange(page, pageSize)
          }}
          scroll={{ x: 'max-content' }}
          bordered
          size="small"
        />
      )}
    </>
  )
}

export default DeviceListComponent
