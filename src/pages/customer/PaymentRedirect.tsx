import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/constant'

const PaymentRedirect = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const orderNumber = useMemo(
    () => searchParams.get('orderNumber') || searchParams.get('vnp_TxnRef'),
    [searchParams]
  )
  const message = useMemo(() => searchParams.get('message') || '', [searchParams])

  useEffect(() => {
    if (orderNumber) {
      navigate(`${ROUTES.PAYMENT_RESULT}?orderNumber=${encodeURIComponent(orderNumber)}`, { replace: true })
      return
    }

    const errorUrl = message
      ? `${ROUTES.PAYMENT_ERROR}?message=${encodeURIComponent(message)}`
      : ROUTES.PAYMENT_ERROR
    navigate(errorUrl, { replace: true })
  }, [navigate, orderNumber, message])

  return null
}

export default PaymentRedirect
