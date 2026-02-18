import { Button, Space, Popconfirm } from 'antd'
import { Edit, Trash2 } from 'lucide-react'
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

interface DeviceListProps {
  devices: Device[]
  isLoading: boolean
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onEdit: (device: Device) => void
  onDelete: (id: string) => void
  onUpdateStatus: (id: string, isActive: boolean) => void
  onPageChange: (page: number, pageSize: number) => void
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
      title: 'Ten thiet bi',
      dataIndex: 'name',
      width: 180,
      sortable: true
    },
    {
      key: 'type',
      title: 'Loai',
      dataIndex: 'type',
      width: 120
    },
    {
      key: 'brand',
      title: 'Thuong hieu',
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
      title: 'Trang thai',
      dataIndex: 'isActive',
      width: 100,
      render: (value: unknown) => {
        const isActive = value as boolean
        return (
          <span className={isActive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {isActive ? 'Hoat dong' : 'Vo hieu hoa'}
          </span>
        )
      }
    },
    {
      key: 'createdAt',
      title: 'Ngay tao',
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
      title: 'Hanh dong',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: DeviceWithKey) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => onEdit(record as unknown as Device)}
          >
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => onUpdateStatus(record._id, !record.isActive)}
          >
            {record.isActive ? 'Vo hieu hoa' : 'Kich hoat'}
          </Button>
          <Popconfirm
            title="Xac nhan xoa"
            description="Ban co chac chan muon xoa thiet bi nay?"
            okText="Xoa"
            cancelText="Huy"
            onConfirm={() => onDelete(record._id)}
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<Trash2 className="w-4 h-4" />}>
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <>
      {isLoading ? (
        <LoaderCommon size="lg" tip="Dang tai thiet bi..." />
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
