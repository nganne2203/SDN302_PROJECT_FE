const normalizeStatus = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim().toLowerCase()
}

export type NormalizedPaymentStatus = '' | 'pending' | 'success' | 'failed' | 'refunded' | 'canceled'
export type PaymentDisplayTone = 'success' | 'warning' | 'error' | 'default'
export interface OrderPaymentDisplay {
  status: NormalizedPaymentStatus
  label: string
  tone: PaymentDisplayTone
}

export const normalizePaymentStatus = (value: unknown): NormalizedPaymentStatus => {
  const status = normalizeStatus(value)
  if (status === 'pending' || status === 'processing') return 'pending'
  if (['success', 'succeeded', 'paid', 'completed', 'complete', 'done'].includes(status)) return 'success'
  if (status === 'failed' || status === 'fail') return 'failed'
  if (['refunded', 'refund', 'refunding'].includes(status)) return 'refunded'
  if (status === 'canceled' || status === 'cancelled') return 'canceled'
  return ''
}

export const getOrderPaymentStatusRaw = (order: unknown, fallback?: unknown): unknown => {
  if (!order || typeof order !== 'object') return fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyOrder = order as any

  // UI rule (per BE contract): prefer order.paymentStatus, then order.payment.status, else fallback (e.g. payment lookup API).
  const preferred = anyOrder.paymentStatus ?? anyOrder.payment?.status ?? anyOrder.payment?.paymentStatus
  return preferred ?? fallback
}

export const isOrderPaid = (order: unknown): boolean => {
  // Do not infer from orderStatus; only trust explicit payment status.
  return normalizePaymentStatus(getOrderPaymentStatusRaw(order)) === 'success'
}

export function getOrderPaymentDisplay(order: unknown, paymentStatusRaw?: unknown): OrderPaymentDisplay {
  const paymentStatus = normalizePaymentStatus(getOrderPaymentStatusRaw(order, paymentStatusRaw))
  switch (paymentStatus) {
  case 'pending':
  case '':
    return { status: 'pending', label: 'Chưa thanh toán', tone: 'warning' }
  case 'success':
    return { status: 'success', label: 'Đã thanh toán', tone: 'success' }
  case 'failed':
    return { status: 'failed', label: 'Thanh toán thất bại', tone: 'error' }
  case 'refunded':
    return { status: 'refunded', label: 'Đã hoàn tiền', tone: 'success' }
  case 'canceled':
    return { status: 'canceled', label: 'Đã hủy thanh toán', tone: 'default' }
  default:
    return { status: paymentStatus, label: 'Không xác định', tone: 'default' }
  }
}

