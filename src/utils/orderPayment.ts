const normalizeStatus = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim().toLowerCase()
}

const PAID_STATUSES = new Set([
  'paid',
  'success',
  'succeeded',
  'completed',
  'complete',
  'done'
])

export const isOrderPaid = (order: unknown): boolean => {
  if (!order || typeof order !== 'object') return false
  const anyOrder = order as any

  const candidates: unknown[] = [
    anyOrder.paymentStatus,
    anyOrder.payment?.status,
    anyOrder.payment?.paymentStatus,
    anyOrder.payment?.result?.status,
    anyOrder.payment?.data?.status,
    anyOrder.paymentResult?.status,
    anyOrder.vnpay?.status,
    anyOrder.vnpayResult?.status
  ]

  if (candidates.some((c) => PAID_STATUSES.has(normalizeStatus(c)))) return true

  const method = normalizeStatus(anyOrder.paymentMethod)
  const orderStatus = normalizeStatus(anyOrder.orderStatus ?? anyOrder.status)
  const deliveryStatus = normalizeStatus(anyOrder.delivery?.status)

  return method === 'cod' && (orderStatus === 'delivered' || deliveryStatus === 'delivered')
}
