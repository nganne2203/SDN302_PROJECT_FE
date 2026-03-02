import { Card, Table, Space } from 'antd'
import { Button } from 'antd'
import { EditOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import dayjs from 'dayjs'
import type { InventoryRecord } from '@/types/api'
import { InputField } from '@/components/common'

/* eslint-disable no-unused-vars */
interface MainInventoryPanelProps {
  data: InventoryRecord[]
  loading: boolean
  pagination: TablePaginationConfig
  onPaginationChange: (_pagination: TablePaginationConfig) => void
  searchText: string
  onSearchTextChange: (_value: string) => void
  onEdit: (_record: InventoryRecord) => void
  onCreate: () => void
  onAdjust: (_record: InventoryRecord) => void
}

const MainInventoryPanel = ({
  data,
  loading,
  pagination,
  onPaginationChange,
  searchText,
  onSearchTextChange,
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

  return (
    <Card
      title="Tồn kho kho tổng"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Tạo mới
        </Button>
      }
    >
      <div className="mb-4">
        <InputField
          label="Tìm kiếm"
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          placeholder="Tìm theo tên sản phẩm"
          className="mb-0"
        />
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
      />
    </Card>
  )
}

export default MainInventoryPanel
