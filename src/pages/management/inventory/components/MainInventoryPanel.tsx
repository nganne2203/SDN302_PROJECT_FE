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
      title: 'San pham',
      dataIndex: ['product', 'name'],
      key: 'productName',
      render: (_: string, record) => record.product?.name || '-'
    },
    {
      title: 'Danh muc',
      dataIndex: ['product', 'category', 'name'],
      key: 'category',
      render: (_: string, record) => record.product?.category?.name || '-'
    },
    {
      title: 'So luong',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Vi tri',
      dataIndex: 'location',
      key: 'location',
      render: (value?: string) => value || '-'
    },
    {
      title: 'Cap nhat',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY')
    },
    {
      title: 'Hanh dong',
      key: 'action',
      render: (_: unknown, record: InventoryRecord) => (
        <Space size="small">
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Sua
          </Button>
          <Button
            type="default"
            size="small"
            icon={<SwapOutlined />}
            onClick={() => onAdjust(record)}
          >
            Dieu chinh
          </Button>
        </Space>
      )
    }
  ]

  return (
    <Card
      title="Ton kho kho tong"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Tao moi
        </Button>
      }
    >
      <div className="mb-4">
        <InputField
          label="Tim kiem"
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          placeholder="Tim theo ten san pham"
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
