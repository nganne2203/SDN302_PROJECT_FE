import { Card, Row, Col, Statistic } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'

interface StockRequestStatsProps {
  pendingCount: number
  approvedCount: number
}

const StockRequestStats = ({ pendingCount, approvedCount }: StockRequestStatsProps) => {
  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="Chờ duyệt"
            value={pendingCount}
            prefix={<ClockCircleOutlined className="text-warning" />}
            styles={{ content: { color: '#faad14' } }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="Đã duyệt"
            value={approvedCount}
            prefix={<CheckCircleOutlined className="text-success" />}
            styles={{ content: { color: '#52c41a' } }}
          />
        </Card>
      </Col>
    </Row>
  )
}

export default StockRequestStats
