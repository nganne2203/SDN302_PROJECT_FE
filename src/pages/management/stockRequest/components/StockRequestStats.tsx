import { Card, Row, Col, Statistic } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

interface StockRequestStatsProps {
  pendingCount: number
  approvedCount: number
  partialCount: number
  rejectCount: number
}

const StockRequestStats = ({ pendingCount, approvedCount, partialCount, rejectCount }: StockRequestStatsProps) => {
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
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="Một phần đã duyệt"
            value={partialCount}
            prefix={<CheckCircleOutlined className="text-warning" />}
            styles={{ content: { color: '#0f65ce' } }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="Đã từ chối"
            value={rejectCount}
            prefix={<CloseCircleOutlined className="text-error" />}
            styles={{ content: { color: '#ff4d4f' } }}
          />
        </Card>
      </Col>
    </Row>
  )
}

export default StockRequestStats
