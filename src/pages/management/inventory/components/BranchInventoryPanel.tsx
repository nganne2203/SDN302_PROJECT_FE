import { useMemo } from 'react'
import { Card, Table, Tag, Row, Col, Statistic, Alert, Empty, Progress, Tooltip, Space, Tabs, Popconfirm, Button } from 'antd'
import { AlertOutlined, CheckCircleOutlined, ShoppingOutlined, EditOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import type { Branch, StoreInventoryRecord } from '@/types/api'
import type { BranchView } from '@/hooks/useInventory'
import { InputField, SelectField } from '@/components/common'
import { ROUTES } from '@/constants/constant'

/* eslint-disable no-unused-vars */
interface BranchInventoryPanelProps {
  isAdmin: boolean
  showAdvancedViews?: boolean
  canEditThresholds: boolean
  canCreate: boolean
  canDelete: boolean
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
  error?: string | null
  onRetry?: () => void
  pagination: TablePaginationConfig
  onPaginationChange: (_pagination: TablePaginationConfig) => void
  onEditThresholds: (_record: StoreInventoryRecord) => void
  onCreate: () => void
  onDelete: (_record: StoreInventoryRecord) => void
}

const BranchInventoryPanel = ({
  isAdmin,
  showAdvancedViews = true,
  canEditThresholds,
  canCreate,
  canDelete,
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
  error,
  onRetry,
  pagination,
  onPaginationChange,
  onEditThresholds,
  onCreate,
  onDelete
}: BranchInventoryPanelProps) => {
  const navigate = useNavigate()
  const activeSkuCount = branchInventory.filter((record) => record.quantity > 0).length

  const branchOptions = useMemo(() => {
    const options = branches.map((branch) => ({ label: branch.name, value: branch._id }))

    if (!selectedBranchId || options.some((option) => option.value === selectedBranchId)) {
      return options
    }

    const fallbackName = branchInventory.find((record) => record.branch?._id === selectedBranchId)?.branch?.name
    return [{ label: fallbackName || 'Chi nhánh của bạn', value: selectedBranchId }, ...options]
  }, [branches, selectedBranchId, branchInventory])

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
      optimal: 'Tối ưu',
      low_stock: 'Sắp hết',
      out_of_stock: 'Hết hàng',
      overstock: 'Quá tồn'
    }
    return labelMap[status] || status
  }

  const currentPage = pagination.current || 1
  const pageSize = pagination.pageSize || 10

  const branchColumns: ColumnsType<StoreInventoryRecord> = [
    {
      key: 'stt',
      title: 'STT',
      width: 70,
      align: 'center',
      fixed: 'left',
      render: (_: unknown, __: StoreInventoryRecord, index: number) => {
        const serialNumber = (currentPage - 1) * pageSize + index + 1
        return <span className="font-medium text-gray-700">#{serialNumber}</span>
      }
    },
    {
      title: 'Sản phẩm',
      dataIndex: ['product', 'name'],
      key: 'productName',
      render: (_: string, record) => record.product?.name || '-'
    },
    {
      title: 'Tồn kho',
      key: 'stockStatus',
      render: (_: unknown, record) => {
        const max = record.maxThreshold || 1
        return (
          <Tooltip title={`Tối thiểu: ${record.minThreshold}, Tối đa: ${record.maxThreshold}`}>
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (_: string, record) => {
        const status = getBranchStatus(record)
        return <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      }
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY')
    },
    ...((canEditThresholds || canDelete)
      ? [{
        title: 'Hành động',
        key: 'action',
        render: (_: unknown, record: StoreInventoryRecord) => (
          <Space size="small">
            {canEditThresholds && (
              <Button
                type="default"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEditThresholds(record)}
              >
                Ngưỡng
              </Button>
            )}
            {canDelete && (
              <Popconfirm
                title="Xóa tồn kho"
                description="Bạn có chắc chắn muốn xóa bản ghi tồn kho này?"
                onConfirm={() => onDelete(record)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="default"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                >
                  Xóa
                </Button>
              </Popconfirm>
            )}
          </Space>
        )
      }]
      : [])
  ]

  const branchViewTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'out_of_stock', label: 'Hết hàng' },
    ...(showAdvancedViews
      ? [
        { key: 'low_stock', label: 'Sắp hết' },
        { key: 'need_restock', label: 'Cần nhập' },
        { key: 'overstock', label: 'Quá tồn' }
      ]
      : [])
  ]

  return (
    <>
      {!selectedBranchId && (
        <Alert
          message="Chưa có chi nhánh"
          description="Vui lòng chọn chi nhánh để xem tồn kho"
          type="warning"
          showIcon
          className="mb-6"
        />
      )}

      {!isAdmin && selectedBranchId && branchStats.lowStock > 0 && (
        <Alert
          message={`Cảnh báo: ${branchStats.lowStock} sản phẩm dưới ngưỡng tối thiểu`}
          description={canCreate
            ? 'Vui lòng tạo yêu cầu nhập kho hoặc cập nhật ngưỡng tồn kho'
            : 'Vui lòng liên hệ quản lý chi nhánh để bổ sung hàng hoặc điều chỉnh ngưỡng'
          }
          type="warning"
          showIcon
          className="mb-6"
          action={canCreate ? (
            <Button size="small" type="primary" onClick={() => navigate(ROUTES.MANAGEMENT.STOCK_REQUESTS)}>
              Tạo yêu cầu nhập kho
            </Button>
          ) : undefined}
        />
      )}

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          className="mb-6"
          action={
            onRetry && (
              <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
                Thử lại
              </Button>
            )
          }
        />
      )}

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Sản phẩm hoạt động"
              value={activeSkuCount}
              prefix={<CheckCircleOutlined className="text-success" />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Sản phẩm tối ưu"
              value={branchStats.optimal}
              prefix={<CheckCircleOutlined className="text-blue-600" />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Sắp hết"
              value={branchStats.lowStock}
              prefix={<AlertOutlined className="text-red-600" />}
              styles={{ content: { color: '#cf1322' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Hết hàng"
              value={branchStats.outOfStock}
              prefix={<ShoppingOutlined className="text-gray-500" />}
              styles={{ content: { color: '#595959' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mb-6">
        <Row gutter={[16, 0]} align="bottom">
          <Col xs={24} md={10} lg={8}>
            <SelectField
              label="Chi nhánh"
              value={selectedBranchId || undefined}
              onChange={(value) => onBranchChange(value as string)}
              options={branchOptions}
              className="mb-0"
              disabled={!isAdmin && branches.length <= 1}
            />
          </Col>
          <Col xs={24} md={14} lg={16}>
            <InputField
              label="Tìm kiếm"
              value={searchText}
              onChange={(e) => onSearchTextChange(e.target.value)}
              placeholder="Tìm theo tên sản phẩm"
              className="mb-0"
            />
          </Col>
        </Row>
      </Card>

      <Tabs
        activeKey={branchView}
        items={branchViewTabs}
        onChange={(key) => onBranchViewChange(key as BranchView)}
      />

      <Card
        title="Danh sách tồn kho chi nhánh"
        extra={
          canCreate && selectedBranchId ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
              Tạo mới
            </Button>
          ) : null
        }
      >
        <Table
          columns={branchColumns}
          dataSource={branchInventory}
          loading={loading}
          pagination={pagination}
          onChange={onPaginationChange}
          scroll={{ x: 900 }}
          rowKey={(record) => record._id}
          size="small"
          locale={{
            emptyText: (
              <Empty
                description="Chưa có dữ liệu tồn kho chi nhánh"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
        />
      </Card>
    </>
  )
}

export default BranchInventoryPanel
