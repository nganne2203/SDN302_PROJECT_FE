import { useEffect } from 'react'
import { DatePicker, Form, Input, Select } from 'antd'
import dayjs from 'dayjs'
import { ButtonCommon, ModalCommon } from '@/components/common'
import type { DeliveryInfo, Order } from '@/types/api'

interface OrderDeliveryUpdateModalProps {
  order: Order | null
  isOpen: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (orderId: string, data: DeliveryInfo) => void | Promise<void>
}

interface DeliveryFormValues {
  providerName?: string
  trackingCode?: string
  status?: string
  estimatedDeliveryDate?: dayjs.Dayjs | null
  deliveredAt?: dayjs.Dayjs | null
  recipientName?: string
}

const DELIVERY_STATUS_OPTIONS = [
  { label: 'Cho xu ly', value: 'pending' },
  { label: 'Dang giao', value: 'shipping' },
  { label: 'Da giao', value: 'delivered' },
  { label: 'Da huy', value: 'cancelled' },
  { label: 'That bai', value: 'failed' }
]

const getOrderId = (order: Order | null) => {
  if (!order) return ''
  return order._id || order.id || ''
}

const OrderDeliveryUpdateModal = ({
  order,
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit
}: OrderDeliveryUpdateModalProps) => {
  const [form] = Form.useForm<DeliveryFormValues>()

  useEffect(() => {
    if (!isOpen || !order) return

    form.setFieldsValue({
      providerName: order.delivery?.providerName || undefined,
      trackingCode: order.delivery?.trackingCode || undefined,
      status: order.delivery?.status || undefined,
      estimatedDeliveryDate: order.delivery?.estimatedDeliveryDate
        ? dayjs(order.delivery.estimatedDeliveryDate)
        : null,
      deliveredAt: order.delivery?.deliveredAt
        ? dayjs(order.delivery.deliveredAt)
        : null,
      recipientName: order.delivery?.recipientName || undefined
    })
  }, [form, isOpen, order])

  const handleFinish = async (values: DeliveryFormValues) => {
    const orderId = getOrderId(order)
    if (!orderId) return

    await onSubmit(orderId, {
      providerName: values.providerName?.trim() || undefined,
      trackingCode: values.trackingCode?.trim() || undefined,
      status: values.status || undefined,
      estimatedDeliveryDate: values.estimatedDeliveryDate?.toISOString() || null,
      deliveredAt: values.deliveredAt?.toISOString() || null,
      recipientName: values.recipientName?.trim() || undefined
    })
  }

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title="Cap nhat giao van"
      footer={
        <div className="flex justify-end gap-2">
          <ButtonCommon variant="outline" onClick={onClose} disabled={isSubmitting}>
            Huy
          </ButtonCommon>
          <ButtonCommon variant="primary" onClick={() => form.submit()} isLoading={isSubmitting}>
            Luu
          </ButtonCommon>
        </div>
      }
    >
      <Form<DeliveryFormValues> form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="Don vi van chuyen" name="providerName">
          <Input placeholder="Giao Hang Nhanh" />
        </Form.Item>

        <Form.Item label="Ma van don" name="trackingCode">
          <Input placeholder="GHN123456789" />
        </Form.Item>

        <Form.Item label="Trang thai giao van" name="status">
          <Select
            allowClear
            placeholder="Chon trang thai"
            options={DELIVERY_STATUS_OPTIONS}
          />
        </Form.Item>

        <Form.Item label="Nguoi nhan" name="recipientName">
          <Input placeholder="Nguyen Van A" />
        </Form.Item>

        <Form.Item label="Du kien giao" name="estimatedDeliveryDate">
          <DatePicker showTime format="DD/MM/YYYY HH:mm" className="w-full" />
        </Form.Item>

        <Form.Item label="Thoi diem giao thanh cong" name="deliveredAt">
          <DatePicker showTime format="DD/MM/YYYY HH:mm" className="w-full" />
        </Form.Item>
      </Form>
    </ModalCommon>
  )
}

export default OrderDeliveryUpdateModal
