import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Row, Col, Space, Statistic, Alert } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { useState } from 'react'
import useAuth from '@/hooks/useAuth'

const StockRequest = () => {
  const { user } = useAuth()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<string | null>(null)

  // Sample data for stock requests
  const [stockRequests, setStockRequests] = useState([
    {
      key: '1',
      requestId: 'REQ-001',
      branch: user?.role === 'manager' ? 'Chi nhánh Hà Nội' : 'Unknown',
      product: 'iPhone 15 Pro',
      quantity: 50,
      status: 'pending',
      requestDate: '2024-01-30',
      requestedBy: 'Nguyễn Văn X',
      approvedBy: null,
      approvalDate: null
    },
    {
      key: '2',
      requestId: 'REQ-002',
      branch: user?.role === 'manager' ? 'Chi nhánh Hà Nội' : 'Chi nhánh TP. HCM',
      product: 'Samsung Galaxy S24',
      quantity: 30,
      status: 'pending',
      requestDate: '2024-01-29',
      requestedBy: 'Trần Thị Y',
      approvedBy: null,
      approvalDate: null
    },
    {
      key: '3',
      requestId: 'REQ-003',
      branch: user?.role === 'manager' ? 'Chi nhánh Hà Nội' : 'Chi nhánh Đà Nẵng',
      product: 'iPad Pro',
      quantity: 20,
      status: 'approved',
      requestDate: '2024-01-28',
      requestedBy: 'Lê Minh Z',
      approvedBy: 'Admin System',
      approvalDate: '2024-01-28'
    }
  ])

  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'

  const handleCreateRequest = () => {
    setEditingId(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditRequest = (record: Record<string, unknown>) => {
    setEditingId(record.key as string)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDeleteRequest = (key: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa yêu cầu',
      content: 'Bạn có chắc muốn xóa yêu cầu nhập kho này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => {
        setStockRequests(stockRequests.filter((req) => req.key !== key))
      }
    })
  }

  const handleApprove = (key: string) => {
    setStockRequests(
      stockRequests.map((req) =>
        req.key === key
          ? {
            ...req,
            status: 'approved',
            approvedBy: user?.fullname || 'Unknown',
            approvalDate: new Date().toISOString().split('T')[0]
          }
          : req
      )
    )
  }

  const handleReject = (key: string) => {
    setStockRequests(
      stockRequests.map((req) =>
        req.key === key
          ? {
            ...req,
            status: 'rejected',
            approvedBy: user?.fullname || 'Unknown',
            approvalDate: new Date().toISOString().split('T')[0]
          }
          : req
      )
    )
  }

  const handleSubmit = (values: Record<string, string | number>) => {
    if (editingId) {
      setStockRequests(
        stockRequests.map((req) =>
          req.key === editingId ? { ...req, ...values } : req
        )
      )
    } else {
      const newRequest = {
        key: `${stockRequests.length + 1}`,
        requestId: `REQ-${String(stockRequests.length + 1).padStart(3, '0')}`,
        branch: values.branch as string,
        product: values.product as string,
        quantity: values.quantity as number,
        status: 'pending',
        requestDate: new Date().toISOString().split('T')[0],
        requestedBy: user?.fullname || 'Unknown',
        approvedBy: null,
        approvalDate: null
      }
      setStockRequests([newRequest, ...stockRequests])
    }
    setIsModalVisible(false)
    form.resetFields()
  }

  const pendingCount = stockRequests.filter((req) => req.status === 'pending').length
  const approvedCount = stockRequests.filter((req) => req.status === 'approved').length

  const columns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'requestId',
      key: 'requestId',
      width: 100
    },
    ...(isAdmin
      ? [
        {
          title: 'Chi nhánh',
          dataIndex: 'branch',
          key: 'branch',
          width: 150
        }
      ]
      : []),
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      width: 150
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (value: number) => `${value} cái`
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      key: 'requestDate',
      width: 120
    },
    {
      title: 'Yêu cầu từ',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
      width: 120
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: 'warning',
          approved: 'success',
          rejected: 'error'
        }
        const labelMap: Record<string, string> = {
          pending: 'Chờ duyệt',
          approved: 'Đã duyệt',
          rejected: 'Bị từ chối'
        }
        return <Tag color={colorMap[status]}>{labelMap[status]}</Tag>
      }
    },
    ...(isAdmin
      ? [
        {
          title: 'Duyệt bởi',
          dataIndex: 'approvedBy',
          key: 'approvedBy',
          width: 120,
          render: (value: string) => value || '-'
        },
        {
          title: 'Ngày duyệt',
          dataIndex: 'approvalDate',
          key: 'approvalDate',
          width: 120,
          render: (value: string) => value || '-'
        }
      ]
      : []),
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Space size="small">
          {isManager && record.status === 'pending' && (
            <>
              <Button
                type="default"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditRequest(record)}
              >
                Sửa
              </Button>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteRequest(record.key as string)}
              >
                Xóa
              </Button>
            </>
          )}
          {isAdmin && record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.key as string)}
              >
                Duyệt
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.key as string)}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isAdmin ? '🏢 Quản lý yêu cầu nhập kho toàn hệ thống' : '📦 Yêu cầu nhập kho chi nhánh'}
        </h1>
        <p className="text-gray-500">
          {isAdmin
            ? 'Duyệt và xuất kho từ inventory chung về các chi nhánh (FE-10)'
            : 'Tạo yêu cầu nhập kho từ kho tổng (FE-10)'}
        </p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Chờ duyệt"
              value={pendingCount}
              prefix={<ClockCircleOutlined className="text-warning" />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Đã duyệt"
              value={approvedCount}
              prefix={<CheckCircleOutlined className="text-success" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Pending Approvals Alert */}
      {isAdmin && pendingCount > 0 && (
        <Alert
          message={`⏳ ${pendingCount} yêu cầu chờ duyệt`}
          description="Vui lòng kiểm tra và phê duyệt các yêu cầu nhập kho từ các chi nhánh"
          type="warning"
          showIcon
          closable
          className="mb-6"
        />
      )}

      {/* Create Request Button */}
      {isManager && (
        <Card className="mb-6">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateRequest}
            size="large"
          >
            Tạo yêu cầu nhập kho mới
          </Button>
        </Card>
      )}

      {/* Stock Requests Table */}
      <Card title="📋 Danh sách yêu cầu nhập kho">
        <Table
          columns={columns}
          dataSource={stockRequests}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingId ? 'Sửa yêu cầu nhập kho' : 'Tạo yêu cầu nhập kho mới'}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            quantity: 1
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
                { label: 'Samsung Galaxy S24', value: 'Samsung Galaxy S24' },
                { label: 'iPad Pro', value: 'iPad Pro' },
                { label: 'Google Pixel 8', value: 'Google Pixel 8' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' }
            ]}
          >
            <InputNumber
              min={1}
              step={1}
              placeholder="Nhập số lượng"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do yêu cầu (tùy chọn)"
          >
            <Input.TextArea
              placeholder="Mô tả lý do yêu cầu nhập kho"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default StockRequest
