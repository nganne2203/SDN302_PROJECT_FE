import { Card, Table, Button, Modal, Form, Input, InputNumber, Tag, Row, Col, Statistic, Alert, Progress, Tooltip, Space } from 'antd'
import {
  EditOutlined,
  AlertOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ShoppingOutlined
} from '@ant-design/icons'
import { useState } from 'react'
import type { ColumnsType } from 'antd/es/table'

interface InventoryItem {
  key: string
  sku: string
  productName: string
  category: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  unitCost: number
  retailPrice: number
  lastRestockDate: string
  location: string
  status: string
}

const BranchInventory = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')

  // Branch inventory data (FE-06)
  const [inventory, setInventory] = useState([
    {
      key: '1',
      sku: 'IP15P-001',
      productName: 'iPhone 15 Pro',
      category: 'Điện thoại',
      currentStock: 45,
      minimumStock: 50,
      maximumStock: 200,
      unitCost: 20000000,
      retailPrice: 25000000,
      lastRestockDate: '2024-01-25',
      location: 'Khu A - Tầng 1',
      status: 'low_stock'
    },
    {
      key: '2',
      sku: 'SGX-S24-001',
      productName: 'Samsung Galaxy S24',
      category: 'Điện thoại',
      currentStock: 120,
      minimumStock: 50,
      maximumStock: 200,
      unitCost: 16000000,
      retailPrice: 20000000,
      lastRestockDate: '2024-01-26',
      location: 'Khu A - Tầng 2',
      status: 'optimal'
    },
    {
      key: '3',
      sku: 'IPD-PRO-001',
      productName: 'iPad Pro',
      category: 'Máy tính bảng',
      currentStock: 25,
      minimumStock: 20,
      maximumStock: 100,
      unitCost: 24000000,
      retailPrice: 30000000,
      lastRestockDate: '2024-01-20',
      location: 'Khu B - Tầng 1',
      status: 'low_stock'
    },
    {
      key: '4',
      sku: 'GPN-8-001',
      productName: 'Google Pixel 8',
      category: 'Điện thoại',
      currentStock: 85,
      minimumStock: 30,
      maximumStock: 150,
      unitCost: 15000000,
      retailPrice: 20000000,
      lastRestockDate: '2024-01-23',
      location: 'Khu C - Tầng 1',
      status: 'optimal'
    },
    {
      key: '5',
      sku: 'OPL-12-001',
      productName: 'OnePlus 12',
      category: 'Điện thoại',
      currentStock: 3,
      minimumStock: 20,
      maximumStock: 100,
      unitCost: 12000000,
      retailPrice: 15000000,
      lastRestockDate: '2024-01-10',
      location: 'Khu C - Tầng 2',
      status: 'critical'
    }
  ])

  const totalValue = inventory.reduce((sum, item) => sum + item.currentStock * item.unitCost, 0)
  const lowStockCount = inventory.filter((item) => item.currentStock < item.minimumStock).length
  const optimalCount = inventory.filter((item) => item.status === 'optimal').length

  const handleEditStock = (record: InventoryItem) => {
    setEditingId(record.key)
    form.setFieldsValue({
      currentStock: record.currentStock,
      minimumStock: record.minimumStock,
      maximumStock: record.maximumStock,
      location: record.location
    })
    setIsModalVisible(true)
  }

  const handleSubmit = (values: Partial<InventoryItem>) => {
    if (editingId) {
      setInventory(
        inventory.map((item) => {
          if (item.key === editingId) {
            const currentStock = values.currentStock ?? item.currentStock
            const minimumStock = values.minimumStock ?? item.minimumStock
            const maximumStock = values.maximumStock ?? item.maximumStock
            const location = values.location ?? item.location

            let status = 'optimal'
            if (currentStock === 0) status = 'out_of_stock'
            else if (currentStock < minimumStock) status = 'low_stock'
            else if (currentStock < minimumStock * 1.5) status = 'warning'

            return {
              ...item,
              currentStock,
              minimumStock,
              maximumStock,
              location,
              status
            }
          }
          return item
        })
      )
    }
    setIsModalVisible(false)
    form.resetFields()
  }

  const filteredInventory = inventory.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchText.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      optimal: 'success',
      low_stock: 'warning',
      critical: 'error',
      out_of_stock: 'error'
    }
    return colorMap[status] || 'default'
  }

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      optimal: 'Tối ưu',
      low_stock: 'Sắp hết',
      critical: 'Rất cấp thiết',
      out_of_stock: 'Hết hàng'
    }
    return labelMap[status] || status
  }

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 110,
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: 150
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 120
    },
    {
      title: 'Tồn kho hiện tại',
      key: 'stockStatus',
      width: 150,
      render: (_: unknown, record: InventoryItem) => (
        <Tooltip title={`Tối thiểu: ${record.minimumStock}, Tối đa: ${record.maximumStock}`}>
          <div>
            <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>
              {record.currentStock} / {record.maximumStock}
            </div>
            <Progress
              percent={(record.currentStock / record.maximumStock) * 100}
              size="small"
              strokeColor={
                record.status === 'optimal'
                  ? '#52c41a'
                  : record.status === 'low_stock'
                    ? '#faad14'
                    : '#cf1322'
              }
            />
          </div>
        </Tooltip>
      )
    },
    {
      title: 'Giá vốn / Bán lẻ',
      key: 'prices',
      width: 150,
      render: (_: unknown, record: InventoryItem) => (
        <div style={{ fontSize: '12px' }}>
          <div>Vốn: {(record.unitCost / 1000000).toFixed(1)}M₫</div>
          <div style={{ color: '#52c41a', fontWeight: 'bold' }}>Bán: {(record.retailPrice / 1000000).toFixed(1)}M₫</div>
        </div>
      )
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      width: 130
    },
    {
      title: 'Ngày nhập cuối',
      dataIndex: 'lastRestockDate',
      key: 'lastRestockDate',
      width: 110
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_: unknown, record: InventoryItem) => (
        <Space size="small">
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditStock(record)}
          >
            Điều chỉnh
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📦 Quản lý tồn kho chi nhánh (FE-06)</h1>
        <p className="text-gray-500">
          Quản lý tồn kho, kiểm kê kho tại chi nhánh của bạn
        </p>
      </div>

      {/* Alert for critical items */}
      {lowStockCount > 0 && (
        <Alert
          message={`⚠️ Cảnh báo: ${lowStockCount} sản phẩm cần nhập hàng`}
          description="Vui lòng tạo yêu cầu nhập kho hoặc điều chỉnh tồn kho"
          type="warning"
          showIcon
          closable
          className="mb-6"
        />
      )}

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tổng giá trị tồn kho"
              value={totalValue}
              prefix={<ShoppingOutlined className="text-blue-600" />}
              valueStyle={{ color: '#1890ff' }}
              suffix="₫"
              precision={0}
              formatter={(value) => `${((value as number) / 1000000).toFixed(1)}M`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="SKU hoạt động"
              value={inventory.length}
              prefix={<CheckCircleOutlined className="text-success" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Sản phẩm tối ưu"
              value={optimalCount}
              prefix={<CheckCircleOutlined className="text-blue-600" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Cần nhập hàng"
              value={lowStockCount}
              prefix={<AlertOutlined className="text-red-600" />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Low Stock Items Summary */}
      {lowStockCount > 0 && (
        <Card className="mb-6" title="⚠️ Sản phẩm cần nhập hàng">
          <Table
            columns={[
              { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 100 },
              { title: 'Tên sản phẩm', dataIndex: 'productName', key: 'productName' },
              {
                title: 'Tồn kho / Tối thiểu',
                key: 'stock',
                render: (_: unknown, record: InventoryItem) => `${record.currentStock} / ${record.minimumStock}`,
                width: 130
              },
              {
                title: 'Cần nhập',
                key: 'needStock',
                width: 100,
                render: (_: unknown, record: InventoryItem) => (
                  <strong style={{ color: '#cf1322' }}>
                    {Math.max(record.minimumStock - record.currentStock, 0)} cái
                  </strong>
                )
              }
            ]}
            dataSource={inventory.filter((item) => item.currentStock < item.minimumStock)}
            pagination={false}
            size="small"
          />
          <Button type="primary" className="mt-4" onClick={() => window.location.href = '/management/stock-requests'}>
            Tạo yêu cầu nhập kho
          </Button>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="mb-6">
        <Input
          placeholder="Tìm kiếm theo SKU hoặc tên sản phẩm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          size="large"
          style={{ maxWidth: '400px' }}
        />
      </Card>

      {/* Inventory Table */}
      <Card title="📋 Danh sách tồn kho">
        <Table<InventoryItem>
          columns={columns as ColumnsType<InventoryItem>}
          dataSource={filteredInventory}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
          size="small"
          rowKey="key"
        />
      </Card>

      {/* Edit/Adjust Stock Modal */}
      <Modal
        title="Điều chỉnh tồn kho"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="currentStock"
            label="Tồn kho hiện tại"
            rules={[
              { required: true, message: 'Vui lòng nhập tồn kho' },
              { type: 'number', min: 0, message: 'Tồn kho phải >= 0' }
            ]}
          >
            <InputNumber
              min={0}
              step={1}
              placeholder="Nhập tồn kho hiện tại"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="minimumStock"
            label="Tồn kho tối thiểu"
            rules={[
              { required: true, message: 'Vui lòng nhập tồn kho tối thiểu' },
              { type: 'number', min: 0 }
            ]}
          >
            <InputNumber
              min={0}
              step={1}
              placeholder="Nhập tồn kho tối thiểu"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="maximumStock"
            label="Tồn kho tối đa"
            rules={[
              { required: true, message: 'Vui lòng nhập tồn kho tối đa' },
              { type: 'number', min: 0 }
            ]}
          >
            <InputNumber
              min={0}
              step={1}
              placeholder="Nhập tồn kho tối đa"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="location"
            label="Vị trí lưu trữ"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
          >
            <Input placeholder="Ví dụ: Khu A - Tầng 1" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BranchInventory
