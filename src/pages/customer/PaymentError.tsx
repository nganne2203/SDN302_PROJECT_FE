import { Button, Card, Result } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/constant'

const PaymentError = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const message = new URLSearchParams(location.search).get('message')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <Card className="w-full max-w-2xl shadow-md">
        <Result
          status="error"
          title="Thanh toán gặp lỗi"
          subTitle={message || 'Không thể xử lý thanh toán. Vui lòng thử lại.'}
          extra={[
            <Button type="primary" key="retry" onClick={() => navigate(ROUTES.CHECKOUT)}>
              Quay lại thanh toán
            </Button>,
            <Button key="cart" onClick={() => navigate(ROUTES.CART)}>
              Về giỏ hàng
            </Button>
          ]}
        />
      </Card>
    </div>
  )
}

export default PaymentError
