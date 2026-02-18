/* eslint-disable no-unused-vars */
import { Button, Space, Popconfirm, Tooltip } from 'antd'
import { Edit, Trash2, Power } from 'lucide-react'
import { TableCommon, LoaderCommon } from '@/components/common'
import type { TableColumn } from '@/components/common/TableCommon'
import type { PricingRule } from '@/features/pricing/pricingTypes'
import dayjs from 'dayjs'
import { formatCurrency } from '@/utils/formatCurrency'

interface PricingWithKey extends Record<string, unknown> {
  key: string
  _id: string
  product: { _id: string; name: string; sku?: string }
  minQuantity: number
  maxQuantity: number | null
  pricePerUnit: number
  discountPercentage?: number
  description?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

interface PricingListProps {
  pricings: PricingRule[]
  isLoading: boolean
  pagination?: {
    page: number
    limit: number
    total: number
  }
  onEdit: (_pricing: PricingRule) => void
  onDelete: (_id: string) => void
  onToggleStatus: (_id: string) => void
  onPageChange: (_page: number, _pageSize: number) => void
}

const PricingListComponent = ({
  pricings,
  isLoading,
  pagination,
  onEdit,
  onDelete,
  onToggleStatus,
  onPageChange
}: PricingListProps) => {
  const pricingWithKeys: PricingWithKey[] = pricings.map(pricing => ({
    ...pricing,
    key: pricing._id
  }))

  const tableColumns: TableColumn<PricingWithKey>[] = [
    {
      key: 'product',
      title: 'San pham',
      dataIndex: ['product', 'name'],
      width: 180
    },
    {
      key: 'range',
      title: 'Khoang so luong',
      width: 140,
      render: (_: unknown, record: PricingWithKey) => {
        const maxValue = record.maxQuantity ?? null
        return `${record.minQuantity} - ${maxValue === null ? 'INF' : maxValue}`
      }
    },
    {
      key: 'pricePerUnit',
      title: 'Gia/1 sp',
      dataIndex: 'pricePerUnit',
      width: 130,
      render: (value: unknown) => formatCurrency(value as number)
    },
    {
      key: 'discountPercentage',
      title: 'Giam gia',
      dataIndex: 'discountPercentage',
      width: 110,
      render: (value: unknown) => {
        const discount = typeof value === 'number' ? value : 0
        return discount > 0 ? `${discount}%` : '-'
      }
    },
    {
      key: 'isActive',
      title: 'Trang thai',
      dataIndex: 'isActive',
      width: 110,
      render: (value: unknown) => {
        const isActive = value as boolean
        return (
          <span className={isActive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {isActive ? 'Hoat dong' : 'Khong hoat dong'}
          </span>
        )
      }
    },
    {
      key: 'updatedAt',
      title: 'Cap nhat',
      dataIndex: 'updatedAt',
      width: 140,
      render: (value: unknown) => {
        if (!value) return '-'
        const dateStr = value as string
        return dayjs(dateStr).format('DD/MM/YYYY HH:mm')
      }
    },
    {
      key: 'actions',
      title: 'Hanh dong',
      width: 160,
      fixed: 'right',
      render: (_: unknown, record: PricingWithKey) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              size="small"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => onEdit(record as unknown as PricingRule)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              size="small"
              icon={<Power className="w-4 h-4" />}
              style={{ color: record.isActive ? '#16a34a' : '#dc2626', borderColor: record.isActive ? '#16a34a' : '#dc2626' }}
              onClick={() => onToggleStatus(record._id)}
            />
          </Tooltip>
          <Popconfirm
            title="Xac nhan xoa"
            description="Ban co chac chan muon xoa bang gia nay?"
            okText="Xoa"
            cancelText="Huy"
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
        <LoaderCommon size="lg" tip="Dang tai bang gia..." />
      ) : (
        <TableCommon<PricingWithKey>
          columns={tableColumns}
          data={pricingWithKeys}
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

export default PricingListComponent
