import { Alert, Card, Empty, Switch, Table, Space, Tag, Input } from 'antd'
import { Button } from 'antd'
import { EditOutlined, PlusOutlined, ReloadOutlined, SwapOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import dayjs from 'dayjs'
import type { InventoryRecord } from '@/types/api'

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
  const currentPage = pagination.current || 1
  const pageSize = pagination.pageSize || 10
  const columns: ColumnsType<InventoryRecord> = [
    {
      key: 'stt',
      title: 'STT',
      width: 70,
      align: 'center',
      fixed: 'left',
      render: (_: unknown, __: InventoryRecord, index: number) => {
        const serialNumber = (currentPage - 1) * pageSize + index + 1
        return <span className="font-medium text-gray-700">#{serialNumber}</span>
      }
    },
    {
      title: 'Sản phẩm',
      dataIndex: ['product', 'name'],
      key: 'productName',
      ellipsis: true,
      render: (_: string, record) => (
        <span className="font-medium text-gray-800">{record.product?.name || '-'}</span>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: ['product', 'category', 'name'],
      key: 'category',
      width: 180,
      render: (_: string, record) => record.product?.category?.name
        ? <Tag color="blue">{record.product.category.name}</Tag>
        : '-'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 110,
      align: 'center',
      render: (value: number) => {
        const isLow = value <= 10
        return (
          <span className={`font-semibold ${isLow ? 'text-red-500' : 'text-gray-700'}`}>
            {isLow && <WarningOutlined className="mr-1" />}
            {value}
          </span>
        )
      }
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      render: (value?: string) => value
        ? <Tag color="geekblue">{value}</Tag>
        : '-'
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      align: 'center',
      render: (value: string) => (
        <span className="text-gray-500 text-sm">{dayjs(value).format('DD/MM/YYYY')}</span>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: InventoryRecord) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Sửa
          </Button>
          <Button
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
      title={<span className="text-lg font-semibold">Tồn kho kho tổng</span>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Tạo mới
        </Button>
      }
      className="shadow-sm"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 w-full">
        <Input
          allowClear
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          placeholder="Tìm theo tên sản phẩm"
          style={{ maxWidth: '80%' }}
        />
        <div className="flex items-center gap-2">
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
        rowKey={(record) => record._id}
        size="middle"
        scroll={{ x: 'max-content' }}
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
