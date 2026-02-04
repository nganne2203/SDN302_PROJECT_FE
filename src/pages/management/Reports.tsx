import { Card, Row, Col, Statistic, Table, DatePicker, Select, Button, Tabs, Space, Spin } from 'antd'
import {
  DollarOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useState } from 'react'
import dayjs from 'dayjs'
import useAuth from '@/hooks/useAuth'

const Reports = () => {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()])
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  const isAdmin = user?.role === 'admin'

  // Revenue data by month (FE-11)
  const revenueData = [
    { month: 'Tháng 1', revenue: 45000000, target: 50000000, orders: 120 },
    { month: 'Tháng 2', revenue: 52000000, target: 50000000, orders: 145 },
    { month: 'Tháng 3', revenue: 48000000, target: 50000000, orders: 135 },
    { month: 'Tháng 4', revenue: 65000000, target: 60000000, orders: 180 },
    { month: 'Tháng 5', revenue: 72000000, target: 70000000, orders: 200 },
    { month: 'Tháng 6', revenue: 68000000, target: 70000000, orders: 190 }
  ]

  // Branch performance data
  const branchPerformanceData = [
    { name: 'Chi nhánh Hà Nội', revenue: 125000000, orders: 320, inventory: 1200, returnRate: 2.5 },
    { name: 'Chi nhánh TP. HCM', revenue: 145000000, orders: 380, inventory: 1500, returnRate: 2.0 },
    { name: 'Chi nhánh Đà Nẵng', revenue: 85000000, orders: 156, inventory: 680, returnRate: 3.2 },
    { name: 'Chi nhánh Hải Phòng', revenue: 65000000, orders: 120, inventory: 450, returnRate: 2.8 }
  ]

  // Top selling products
  const topProducts = [
    { key: '1', product: 'iPhone 15 Pro', sold: 450, revenue: 112500000, returnRate: 1.5 },
    { key: '2', product: 'Samsung Galaxy S24', sold: 320, revenue: 64000000, returnRate: 2.0 },
    { key: '3', product: 'iPad Pro', sold: 280, revenue: 84000000, returnRate: 1.2 },
    { key: '4', product: 'Google Pixel 8', sold: 210, revenue: 52500000, returnRate: 2.5 },
    { key: '5', product: 'OnePlus 12', sold: 180, revenue: 36000000, returnRate: 1.8 }
  ]

  // Inventory status
  const inventoryData = [
    { name: 'Tồn kho tốt', value: 65, fill: '#52c41a' },
    { name: 'Sắp hết', value: 20, fill: '#faad14' },
    { name: 'Hết hàng', value: 15, fill: '#cf1322' }
  ]

  // Order status distribution
  const orderStatusData = [
    { month: 'Tuần 1', pending: 15, processing: 25, completed: 120, canceled: 5 },
    { month: 'Tuần 2', pending: 12, processing: 30, completed: 135, canceled: 3 },
    { month: 'Tuần 3', pending: 18, processing: 28, completed: 125, canceled: 4 },
    { month: 'Tuần 4', pending: 10, processing: 22, completed: 140, canceled: 2 }
  ]

  const handleExportReport = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Báo cáo đã được xuất thành công!')
    }, 1000)
  }

  const branchColumns = [
    { title: 'Chi nhánh', dataIndex: 'name', key: 'name' },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => `${value.toLocaleString('vi-VN')} ₫`
    },
    { title: 'Đơn hàng', dataIndex: 'orders', key: 'orders' },
    { title: 'Tồn kho', dataIndex: 'inventory', key: 'inventory' },
    {
      title: 'Tỷ lệ hoàn trả',
      dataIndex: 'returnRate',
      key: 'returnRate',
      render: (value: number) => `${value}%`
    }
  ]

  const productColumns = [
    { title: 'Sản phẩm', dataIndex: 'product', key: 'product' },
    { title: 'Đã bán', dataIndex: 'sold', key: 'sold', render: (value: number) => `${value} cái` },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => `${value.toLocaleString('vi-VN')} ₫`
    },
    {
      title: 'Tỷ lệ hoàn trả',
      dataIndex: 'returnRate',
      key: 'returnRate',
      render: (value: number) => `${value}%`
    }
  ]

  return (
    <Spin spinning={loading}>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📊 Báo cáo & Thống kê (FE-11)</h1>
          <p className="text-gray-500">
            {isAdmin
              ? 'Xem báo cáo doanh thu, tồn kho, hiệu suất từng chi nhánh và toàn hệ thống'
              : 'Xem báo cáo doanh thu, tồn kho, hiệu suất chi nhánh của bạn'}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <Space>
            <label>Khoảng thời gian:</label>
            <DatePicker.RangePicker
              value={[dateRange[0] || null, dateRange[1] || null]}
              onChange={(dates) => setDateRange(dates ? [dates[0] || dayjs(), dates[1] || dayjs()] : [dayjs().subtract(30, 'days'), dayjs()])}
            />
            {isAdmin && (
              <>
                <label>Chi nhánh:</label>
                <Select
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                  style={{ width: 200 }}
                  options={[
                    { label: 'Tất cả chi nhánh', value: 'all' },
                    { label: 'Chi nhánh Hà Nội', value: 'hn' },
                    { label: 'Chi nhánh TP. HCM', value: 'hcm' },
                    { label: 'Chi nhánh Đà Nẵng', value: 'dn' },
                    { label: 'Chi nhánh Hải Phòng', value: 'hp' }
                  ]}
                />
              </>
            )}
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportReport}>
              Xuất báo cáo
            </Button>
          </Space>
        </Card>

        {/* Key Metrics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Tổng doanh thu"
                value={420000000}
                prefix={<DollarOutlined className="text-green-600" />}
                valueStyle={{ color: '#52c41a' }}
                suffix="₫"
              />
              <p className="text-xs text-green-600 mt-2">
                <ArrowUpOutlined /> 12% so với tháng trước
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Tổng đơn hàng"
                value={1371}
                prefix={<ShoppingCartOutlined className="text-blue-600" />}
                valueStyle={{ color: '#1890ff' }}
              />
              <p className="text-xs text-blue-600 mt-2">
                <ArrowUpOutlined /> 8% so với tháng trước
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Tỷ lệ hoàn thành"
                value={97.5}
                prefix={<PercentageOutlined className="text-green-600" />}
                valueStyle={{ color: '#3f8600' }}
                suffix="%"
              />
              <p className="text-xs text-green-600 mt-2">
                <ArrowUpOutlined /> 2% so với tháng trước
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Tổng tồn kho"
                value={4830}
                prefix={<ShoppingCartOutlined className="text-orange-600" />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <p className="text-xs text-orange-600 mt-2">
                <ArrowDownOutlined /> 5% so với tháng trước
              </p>
            </Card>
          </Col>
        </Row>

        {/* Tabs for different report sections */}
        <Card>
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: '📈 Doanh thu theo thời gian',
                children: (
                  <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${(value as number).toLocaleString('vi-VN')} ₫`} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#52c41a" name="Doanh thu" strokeWidth={2} />
                        <Line type="monotone" dataKey="target" stroke="#faad14" name="Mục tiêu" strokeWidth={2} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )
              },
              {
                key: '2',
                label: '📊 Đơn hàng theo tuần',
                children: (
                  <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={orderStatusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="pending" fill="#faad14" name="Chờ xử lý" />
                        <Bar dataKey="processing" fill="#1890ff" name="Đang xử lý" />
                        <Bar dataKey="completed" fill="#52c41a" name="Hoàn thành" />
                        <Bar dataKey="canceled" fill="#cf1322" name="Đã hủy" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )
              },
              {
                key: '3',
                label: '🏪 Hiệu suất chi nhánh',
                children: (
                  <Table
                    columns={branchColumns}
                    dataSource={branchPerformanceData}
                    pagination={false}
                    size="small"
                  />
                )
              },
              {
                key: '4',
                label: '🛍️ Sản phẩm bán chạy',
                children: (
                  <Table
                    columns={productColumns}
                    dataSource={topProducts}
                    pagination={false}
                    size="small"
                  />
                )
              },
              {
                key: '5',
                label: '📦 Trạng thái tồn kho',
                children: (
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={inventoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {inventoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <h4 style={{ marginBottom: '16px' }}>Chi tiết tồn kho</h4>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ color: '#52c41a', marginBottom: '4px' }}>✓ Tồn kho tốt (65%)</div>
                          <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>Hàng được dự trữ đầy đủ</p>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ color: '#faad14', marginBottom: '4px' }}>⚠ Sắp hết (20%)</div>
                          <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>Cần nhập thêm sớm</p>
                        </div>
                        <div>
                          <div style={{ color: '#cf1322', marginBottom: '4px' }}>✕ Hết hàng (15%)</div>
                          <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>Cần nhập ngay lập tức</p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                )
              }
            ]}
          />
        </Card>
      </div>
    </Spin>
  )
}

export default Reports
