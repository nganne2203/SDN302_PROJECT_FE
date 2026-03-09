import { Alert, Card, Empty, Switch, Table, Space } from 'antd'
import { Button } from 'antd'
import { EditOutlined, PlusOutlined, ReloadOutlined, SwapOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import dayjs from 'dayjs'
import type { InventoryRecord } from '@/types/api'
import { InputField } from '@/components/common'

/* eslint-disable no-unused-vars */
interface MainInventoryPanelProps {
  data: InventoryRecord[]
  loading: boolean
  error?: string | null
  onRetry?: () => void
  pagination: TablePaginationConfig
  onPaginationChange: (_pagination: TablePaginationConfig) => void
  searchText: string
  onSearchTextChange: (_value: string) => void
  lowStockOnly?: boolean
  onLowStockToggle?: (_value: boolean) => void
  onEdit: (_record: InventoryRecord) => void
  onCreate: () => void
  onAdjust: (_record: InventoryRecord) => void
}

const MainInventoryPanel = ({
  data,
  loading,
  error,
  onRetry,
  pagination,
  onPaginationChange,
  searchText,
  onSearchTextChange,
  lowStockOnly = false,
  onLowStockToggle,
  onEdit,
  onCreate,
  onAdjust
}: MainInventoryPanelProps) => {
  const columns: ColumnsType<InventoryRecord> = [
    {
      title: 'Sản phẩm',
      dataIndex: ['product', 'name'],
      key: 'productName',
      render: (_: string, record) => record.product?.name || '-'
    },
    {
      title: 'Danh mục',
      dataIndex: ['product', 'category', 'name'],
      key: 'category',
      render: (_: string, record) => record.product?.category?.name || '-'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      render: (value?: string) => value || '-'
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY')
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: InventoryRecord) => (
        <Space size="small">
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="default"
            size="small"
            icon={<SwapOutlined />}
            onClick={() => onAdjust(record)}
          >
            Điều chỉnh
          </Button>
        </Space>
      )
    }
  ]

  if (error) {
    return (
      <Card>
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            onRetry && (
              <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
                Thử lại
              </Button>
            )
          }
        />
      </Card>
    )
  }

  return (
    <Card
      title="Tồn kho kho tổng"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Tạo mới
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <InputField
          label="Tìm kiếm"
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          placeholder="Tìm theo tên sản phẩm"
          className="mb-0 min-w-[240px]"
        />
        <div className="flex items-center gap-2 pb-1">
          <Switch
            checked={lowStockOnly}
            onChange={onLowStockToggle}
            size="small"
          />
          <span className="text-sm text-gray-600">Chỉ hiển thị sắp hết hàng</span>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onChange={onPaginationChange}
        scroll={{ x: 900 }}
        rowKey={(record) => record._id}
        size="small"
        locale={{
          emptyText: (
            <Empty
              description={lowStockOnly ? 'Không có sản phẩm sắp hết hàng' : 'Chưa có dữ liệu tồn kho'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
      />
    </Card>
  )
}

export default MainInventoryPanel
