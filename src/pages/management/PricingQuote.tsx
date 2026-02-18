import { Card, Table, Button, Modal, Form, InputNumber, Select, Tag, Row, Col, Space, Statistic, Divider } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  PercentageOutlined
} from '@ant-design/icons'
import { useState } from 'react'
import useAuth from '@/hooks/useAuth'
import type { ColumnsType } from 'antd/es/table'

interface PricingQuote {
  key: string
  quoteId: string
  product: string
  quantityFrom: number
  quantityTo?: number
  basePrice: number
  discountPercent: number
  finalPrice: number
  status: string
  createdDate: string
  createdBy: string
}

const PricingQuote = () => {
  const { user } = useAuth()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<string | null>(null)

  // Sample pricing quote data (FE-08: Quantity-based discounts)
  const [pricingQuotes, setPricingQuotes] = useState<PricingQuote[]>([
    {
      key: '1',
      quoteId: 'QT-001',
      product: 'iPhone 15 Pro',
      quantityFrom: 1,
      quantityTo: 10,
      basePrice: 25000000,
      discountPercent: 0,
      finalPrice: 25000000,
      status: 'active',
      createdDate: '2024-01-20',
      createdBy: 'Admin System'
    },
    {
      key: '2',
      quoteId: 'QT-002',
      product: 'iPhone 15 Pro',
      quantityFrom: 11,
      quantityTo: 50,
      basePrice: 25000000,
      discountPercent: 5,
      finalPrice: 23750000,
      status: 'active',
      createdDate: '2024-01-20',
      createdBy: 'Admin System'
    },
    {
      key: '3',
      quoteId: 'QT-003',
      product: 'iPhone 15 Pro',
      quantityFrom: 51,
      quantityTo: undefined,
      basePrice: 25000000,
      discountPercent: 10,
      finalPrice: 22500000,
      status: 'active',
      createdDate: '2024-01-20',
      createdBy: 'Admin System'
    },
    {
      key: '4',
      quoteId: 'QT-004',
      product: 'Samsung Galaxy S24',
      quantityFrom: 1,
      quantityTo: 10,
      basePrice: 20000000,
      discountPercent: 0,
      finalPrice: 20000000,
      status: 'active',
      createdDate: '2024-01-19',
      createdBy: 'Admin System'
    },
    {
      key: '5',
      quoteId: 'QT-005',
      product: 'Samsung Galaxy S24',
      quantityFrom: 11,
      quantityTo: undefined,
      basePrice: 20000000,
      discountPercent: 7,
      finalPrice: 18600000,
      status: 'active',
      createdDate: '2024-01-19',
      createdBy: 'Admin System'
    }
  ])

  const handleCreateQuote = () => {
    setEditingId(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditQuote = (record: PricingQuote) => {
    setEditingId(record.key)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDeleteQuote = (key: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa phiếu báo giá',
      content: 'Bạn có chắc muốn xóa phiếu báo giá này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => {
        setPricingQuotes(pricingQuotes.filter((quote) => quote.key !== key))
      }
    })
  }

  const handleDeactivate = (key: string) => {
    setPricingQuotes(
      pricingQuotes.map((quote) =>
        quote.key === key ? { ...quote, status: 'inactive' } : quote
      )
    )
  }

  const handleActivate = (key: string) => {
    setPricingQuotes(
      pricingQuotes.map((quote) =>
        quote.key === key ? { ...quote, status: 'active' } : quote
      )
    )
  }

  type PricingQuoteFormValues = {
    product: string
    quantityFrom: number
    quantityTo?: number
    basePrice: number
    discountPercent: number
  }

  const handleSubmit = (values: PricingQuoteFormValues) => {
    // Calculate final price
    const finalPrice = values.basePrice * (1 - values.discountPercent / 100)

    if (editingId) {
      setPricingQuotes(
        pricingQuotes.map((quote) => {
          if (quote.key !== editingId) return quote
          return {
            ...quote,
            product: values.product,
            quantityFrom: values.quantityFrom,
            quantityTo: values.quantityTo ?? undefined,
            basePrice: values.basePrice,
            discountPercent: values.discountPercent,
            finalPrice,
            createdDate: quote.createdDate,
            createdBy: quote.createdBy
          }
        })
      )
    } else {
      const newQuote: PricingQuote = {
        key: `${pricingQuotes.length + 1}`,
        quoteId: `QT-${String(pricingQuotes.length + 1).padStart(3, '0')}`,
        product: values.product,
        quantityFrom: values.quantityFrom,
        quantityTo: values.quantityTo ?? undefined,
        basePrice: values.basePrice,
        discountPercent: values.discountPercent,
        finalPrice,
        status: 'active',
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: user?.fullname || 'Unknown'
      }
      setPricingQuotes([newQuote, ...pricingQuotes])
    }
    setIsModalVisible(false)
    form.resetFields()
  }

  const activeCount = pricingQuotes.filter((quote) => quote.status === 'active').length
  const totalQuotes = pricingQuotes.length

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'quoteId',
      key: 'quoteId',
      width: 100
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      width: 150
    },
    {
      title: 'Khoảng số lượng',
      key: 'quantityRange',
      width: 130,
      render: (_: unknown, record: PricingQuote) => {
        const to = record.quantityTo || '∞'
        return `${record.quantityFrom} - ${to}`
      }
    },
    {
      title: 'Giá gốc',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 130,
      render: (value: number) => `${value.toLocaleString('vi-VN')} ₫`
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      width: 100,
      render: (value: number) => (
        <span>
          <PercentageOutlined /> {value}%
        </span>
      )
    },
    {
      title: 'Giá cuối cùng',
      dataIndex: 'finalPrice',
      key: 'finalPrice',
      width: 140,
      render: (value: number) => (
        <strong style={{ color: '#52c41a' }}>
          {value.toLocaleString('vi-VN')} ₫
        </strong>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_: unknown, record: PricingQuote) => (
        <Space size="small">
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditQuote(record)}
          >
            Sửa
          </Button>
          {record.status === 'active' ? (
            <Button
              type="default"
              size="small"
              onClick={() => handleDeactivate(record.key)}
            >
              Tắt
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={() => handleActivate(record.key)}
            >
              Bật
            </Button>
          )}
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteQuote(record.key)}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">💰 Quản lý phiếu báo giá (FE-08)</h1>
        <p className="text-gray-500">
          Tạo và quản lý phiếu báo giá với giảm giá dựa trên số lượng sản phẩm mua
        </p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Tổng phiếu báo giá"
              value={totalQuotes}
              prefix={<CheckCircleOutlined className="text-blue-600" />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Phiếu hoạt động"
              value={activeCount}
              prefix={<CheckCircleOutlined className="text-success" />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Giảm giá tối đa"
              value={10}
              prefix={<PercentageOutlined className="text-warning" />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* How it works */}
      <Card className="mb-6" title="ℹ️ Hướng dẫn sử dụng">
        <p>
          <strong>Phiếu báo giá</strong> giúp bạn thiết lập giảm giá dựa trên số lượng sản phẩm khách hàng mua:
        </p>
        <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
          <li>
            <strong>Giá gốc:</strong> Giá bán lẻ của sản phẩm
          </li>
          <li>
            <strong>Khoảng số lượng:</strong> Khoảng số lượng tối thiểu và tối đa để áp dụng phiếu này
          </li>
          <li>
            <strong>Giảm giá:</strong> Phần trăm giảm giá áp dụng cho khoảng số lượng này
          </li>
          <li>
            <strong>Giá cuối cùng:</strong> Giá sau khi áp dụng giảm giá
          </li>
        </ul>
        <Divider />
        <p style={{ marginBottom: '0' }}>
          <strong>Ví dụ:</strong> iPhone 15 Pro có giá gốc 25,000,000₫. Nếu khách mua 11-50 chiếc sẽ giảm 5% = 23,750,000₫/chiếc
        </p>
      </Card>

      {/* Create Quote Button */}
      <Card className="mb-6">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateQuote}
          size="large"
        >
          Tạo phiếu báo giá mới
        </Button>
      </Card>

      {/* Pricing Quotes Table */}
      <Card title="📋 Danh sách phiếu báo giá">
        <Table<PricingQuote>
          columns={columns as ColumnsType<PricingQuote>}
          dataSource={pricingQuotes}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          size="small"
          rowKey="key"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingId ? 'Sửa phiếu báo giá' : 'Tạo phiếu báo giá mới'}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            basePrice: 0,
            discountPercent: 0
          }}
        >
          <Form.Item
            name="product"
            label="Sản phẩm"
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
          >
            <Select
              placeholder="Chọn sản phẩm"
              options={[
                { label: 'iPhone 15 Pro', value: 'iPhone 15 Pro' },
                { label: 'iPhone 15', value: 'iPhone 15' },
                { label: 'Samsung Galaxy S24', value: 'Samsung Galaxy S24' },
                { label: 'Samsung Galaxy A15', value: 'Samsung Galaxy A15' },
                { label: 'iPad Pro', value: 'iPad Pro' },
                { label: 'Google Pixel 8', value: 'Google Pixel 8' },
                { label: 'OnePlus 12', value: 'OnePlus 12' }
              ]}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="quantityFrom"
                label="Số lượng từ"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng' },
                  { type: 'number', min: 1, message: 'Phải lớn hơn 0' }
                ]}
              >
                <InputNumber
                  min={1}
                  step={1}
                  placeholder="Số lượng tối thiểu"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="quantityTo"
                label="Số lượng đến (để trống = không giới hạn)"
              >
                <InputNumber
                  min={1}
                  step={1}
                  placeholder="Số lượng tối đa"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="basePrice"
            label="Giá gốc (₫)"
            rules={[
              { required: true, message: 'Vui lòng nhập giá gốc' },
              { type: 'number', min: 0, message: 'Giá phải lớn hơn hoặc bằng 0' }
            ]}
          >
            <InputNumber
              min={0}
              step={100000}
              placeholder="Nhập giá gốc"
              style={{ width: '100%' }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
            />
          </Form.Item>

          <Form.Item
            name="discountPercent"
            label="Giảm giá (%)"
            rules={[
              { required: true, message: 'Vui lòng nhập phần trăm giảm giá' },
              {
                type: 'number',
                min: 0,
                max: 100,
                message: 'Giảm giá phải từ 0 đến 100%'
              }
            ]}
          >
            <InputNumber
              min={0}
              max={100}
              step={1}
              placeholder="Nhập phần trăm giảm giá"
              style={{ width: '100%' }}
              suffix="%"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PricingQuote
