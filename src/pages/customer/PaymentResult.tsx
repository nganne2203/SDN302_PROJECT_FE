import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Result, Spin } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import paymentApi from '@/apis/payment'
import { ROUTES } from '@/constants/constant'

const PaymentResult = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'success' | 'pending' | 'error'>('pending')
  const [description, setDescription] = useState('Đang kiểm tra trạng thái thanh toán...')

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const orderNumber = useMemo(
    () => searchParams.get('orderNumber') || searchParams.get('vnp_TxnRef'),
    [searchParams]
  )

  useEffect(() => {
    const checkPayment = async () => {
      try {
        const response = await paymentApi.checkPaymentResult(orderNumber as string)
        const paymentStatus = response.data?.status
        if (paymentStatus === 'success') {
          setStatus('success')
          setDescription('Thanh toán VNPay thành công. Cảm ơn bạn đã mua sắm!')
        } else if (paymentStatus === 'pending') {
          setStatus('pending')
          setDescription('Thanh toán đang được xử lý. Vui lòng chờ trong giây lát.')
        } else {
          setStatus('error')
          setDescription('Thanh toán không thành công hoặc đã bị hủy.')
        }
      } catch {
        setStatus('error')
        setDescription('Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại.')
      }
    }

    if (orderNumber) {
      checkPayment()
    }
  }, [orderNumber])

  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
        <Card className="w-full max-w-2xl shadow-md">
          <Result
            status="error"
            title="Thiếu thông tin thanh toán"
            subTitle="Không tìm thấy mã đơn hàng để kiểm tra thanh toán"
            extra={[
              <Button type="primary" key="home" onClick={() => navigate(ROUTES.HOME)}>
                Về trang chủ
              </Button>
            ]}
          />
        </Card>
      </div>
    )
  }

  const getResultProps = () => {
    if (status === 'success') {
      return {
        status: 'success' as const,
        title: 'Thanh toán thành công',
        subTitle: description
      }
    }
    if (status === 'pending') {
      return {
        status: 'info' as const,
        title: 'Đang xử lý thanh toán',
        subTitle: description
      }
    }
    return {
      status: 'error' as const,
      title: 'Thanh toán thất bại',
      subTitle: description
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <Card className="w-full max-w-2xl shadow-md">
        <Spin spinning={status === 'pending'} tip="Đang kiểm tra thanh toán...">
          <Result
            {...getResultProps()}
            extra={[
              <Button type="primary" key="orders" onClick={() => navigate(ROUTES.ORDERS)}>
                Xem đơn hàng
              </Button>,
              <Button key="home" onClick={() => navigate(ROUTES.HOME)}>
                Về trang chủ
              </Button>
            ]}
          />
        </Spin>
      </Card>
    </div>
  )
}

export default PaymentResult
