import { Button, Space, Popconfirm, Tooltip } from 'antd'
import { Edit, Trash2, Power } from 'lucide-react'
import { TableCommon, LoaderCommon } from '@/components/common'
import type { TableColumn } from '@/components/common/TableCommon'
import type { Device } from '@/features/device/deviceTypes'
import { getDeviceTypeLabel } from '@/features/device/deviceTypes'
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

  const currentPage = pagination?.page || 1
  const pageSize = pagination?.limit || 10
  const tableColumns: TableColumn<DeviceWithKey>[] = [
    {
      key: 'stt',
      title: 'STT',
      width: 70,
      align: 'center',
      fixed: 'left',
      render: (_: unknown, __: DeviceWithKey, index: number) => {
        const serialNumber = (currentPage - 1) * pageSize + index + 1
        return <span className="font-medium text-gray-700">#{serialNumber}</span>
      }
    },
    {
      key: 'name',
      title: 'Tên thiết bị',
      dataIndex: 'name',
      width: 180,
      sortable: true,
      ellipsis: true,
      render: (value: unknown) => {
        const name = typeof value === 'string' ? value : '-'
        return (
          <Tooltip title={name}>
            <div className="max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis">
              {name}
            </div>
          </Tooltip>
        )
      }
    },
    {
      key: 'type',
      title: 'Loại',
      dataIndex: 'type',
      width: 160,
      render: (value: unknown) => getDeviceTypeLabel(value as string)
    },
    {
      key: 'brand',
      title: 'Thương hiệu',
      dataIndex: 'brand',
      width: 150,
      ellipsis: true,
      render: (value: unknown) => {
        const brand = typeof value === 'string' ? value : '-'
        return (
          <Tooltip title={brand}>
            <div className="max-w-[170px] overflow-hidden whitespace-nowrap text-ellipsis">
              {brand}
            </div>
          </Tooltip>
        )
      }
    },
    {
      key: 'model',
      title: 'Model',
      dataIndex: 'model',
      width: 160,
      ellipsis: true,
      render: (value: unknown) => {
        const model = typeof value === 'string' ? value : '-'
        return (
          <Tooltip title={model}>
            <div className="max-w-[180px] overflow-hidden whitespace-nowrap text-ellipsis">
              {model}
            </div>
          </Tooltip>
        )
      }
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
          {!record.isActive && (
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
          )}
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
