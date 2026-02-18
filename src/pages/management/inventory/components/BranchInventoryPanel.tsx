import { Card, Table, Tag, Row, Col, Statistic, Alert, Progress, Tooltip, Space, Tabs } from 'antd'
import { AlertOutlined, CheckCircleOutlined, ShoppingOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import dayjs from 'dayjs'
import type { Branch, StoreInventoryRecord } from '@/types/api'
import type { BranchView } from '@/hooks/useInventory'
import { InputField, SelectField } from '@/components/common'
import { Button } from 'antd'

/* eslint-disable no-unused-vars */
interface BranchInventoryPanelProps {
  isAdmin: boolean
  canEditThresholds: boolean
  branches: Branch[]
  selectedBranchId: string | null
  onBranchChange: (_branchId: string) => void
  branchView: BranchView
  onBranchViewChange: (_view: BranchView) => void
  branchInventory: StoreInventoryRecord[]
  branchStats: { lowStock: number; outOfStock: number; optimal: number }
  searchText: string
  onSearchTextChange: (_value: string) => void
  loading: boolean
  pagination: TablePaginationConfig
  onPaginationChange: (_pagination: TablePaginationConfig) => void
  onEditThresholds: (_record: StoreInventoryRecord) => void
}

const BranchInventoryPanel = ({
  isAdmin,
  canEditThresholds,
  branches,
  selectedBranchId,
  onBranchChange,
  branchView,
  onBranchViewChange,
  branchInventory,
  branchStats,
  searchText,
  onSearchTextChange,
  loading,
  pagination,
  onPaginationChange,
  onEditThresholds
}: BranchInventoryPanelProps) => {
  const getBranchStatus = (record: StoreInventoryRecord) => {
    if (record.quantity <= 0) return 'out_of_stock'
    if (record.quantity < record.minThreshold) return 'low_stock'
    if (record.quantity > record.maxThreshold) return 'overstock'
    return 'optimal'
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      optimal: 'success',
      low_stock: 'warning',
      out_of_stock: 'error',
      overstock: 'processing'
    }
    return colorMap[status] || 'default'
  }

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      optimal: 'Toi uu',
      low_stock: 'Sap het',
      out_of_stock: 'Het hang',
      overstock: 'Qua ton'
    }
    return labelMap[status] || status
  }

  const branchColumns: ColumnsType<StoreInventoryRecord> = [
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
      title: 'Ton kho',
      key: 'stockStatus',
      render: (_: unknown, record) => {
        const max = record.maxThreshold || 1
        return (
          <Tooltip title={`Toi thieu: ${record.minThreshold}, Toi da: ${record.maxThreshold}`}>
            <div>
              <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                {record.quantity} / {record.maxThreshold}
              </div>
              <Progress
                percent={Math.min((record.quantity / max) * 100, 100)}
                size="small"
                strokeColor={
                  record.quantity <= 0
                    ? '#cf1322'
                    : record.quantity < record.minThreshold
                      ? '#faad14'
                      : record.quantity > record.maxThreshold
                        ? '#1890ff'
                        : '#52c41a'
                }
              />
            </div>
          </Tooltip>
        )
      }
    },
    {
      title: 'Trang thai',
      dataIndex: 'status',
      key: 'status',
      render: (_: string, record) => {
        const status = getBranchStatus(record)
        return <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      }
    },
    {
      title: 'Cap nhat',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY')
    },
    ...(canEditThresholds
      ? [
        {
          title: 'Hanh dong',
          key: 'action',
          render: (_: unknown, record: StoreInventoryRecord) => (
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEditThresholds(record)}
            >
              Nguong
            </Button>
          )
        }
      ]
      : [])
  ]

  const branchViewTabs = [
    { key: 'all', label: 'Tat ca' },
    { key: 'out_of_stock', label: 'Het hang' },
    { key: 'low_stock', label: 'Sap het' },
    { key: 'need_restock', label: 'Can nhap' },
    { key: 'overstock', label: 'Qua ton' }
  ]

  return (
    <>
      {!selectedBranchId && (
        <Alert
          message="Chua co chi nhanh"
          description="Vui long chon chi nhanh de xem ton kho"
          type="warning"
          showIcon
          className="mb-6"
        />
      )}

      {selectedBranchId && branchStats.lowStock > 0 && (
        <Alert
          message={`Canh bao: ${branchStats.lowStock} san pham duoi nguong toi thieu`}
          description="Vui long tao yeu cau nhap kho hoac cap nhat nguong ton kho"
          type="warning"
          showIcon
          className="mb-6"
        />
      )}

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="SKU hoat dong"
              value={branchInventory.length}
              prefix={<CheckCircleOutlined className="text-success" />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="San pham toi uu"
              value={branchStats.optimal}
              prefix={<CheckCircleOutlined className="text-blue-600" />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Sap het"
              value={branchStats.lowStock}
              prefix={<AlertOutlined className="text-red-600" />}
              styles={{ content: { color: '#cf1322' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Het hang"
              value={branchStats.outOfStock}
              prefix={<ShoppingOutlined className="text-gray-500" />}
              styles={{ content: { color: '#595959' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mb-6">
        <Space wrap>
          {isAdmin && (
            <SelectField
              label="Chi nhanh"
              value={selectedBranchId || undefined}
              onChange={(value) => onBranchChange(value as string)}
              options={branches.map((branch) => ({ label: branch.name, value: branch._id }))}
              className="mb-0 min-w-[240px]"
            />
          )}
          <InputField
            label="Tim kiem"
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
            placeholder="Tim theo ten san pham"
            className="mb-0 min-w-[240px]"
          />
        </Space>
      </Card>

      <Tabs
        activeKey={branchView}
        items={branchViewTabs}
        onChange={(key) => onBranchViewChange(key as BranchView)}
      />

      <Card title="Danh sach ton kho chi nhanh">
        <Table
          columns={branchColumns}
          dataSource={branchInventory}
          loading={loading}
          pagination={pagination}
          onChange={onPaginationChange}
          scroll={{ x: 900 }}
          rowKey={(record) => record._id}
          size="small"
        />
      </Card>
    </>
  )
}

export default BranchInventoryPanel
