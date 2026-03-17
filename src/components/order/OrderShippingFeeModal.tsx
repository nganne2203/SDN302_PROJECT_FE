import { useEffect } from 'react'
import { Form, InputNumber } from 'antd'
import { ButtonCommon, ModalCommon } from '@/components/common'
import type { Order } from '@/types/api'

interface OrderShippingFeeModalProps {
  order: Order | null
  isOpen: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (orderId: string, shippingFee: number) => void | Promise<void>
}

interface ShippingFeeFormValues {
  shippingFee: number
}

const getOrderId = (order: Order | null) => {
  if (!order) return ''
  return order._id || order.id || ''
}

const OrderShippingFeeModal = ({
  order,
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit
}: OrderShippingFeeModalProps) => {
  const [form] = Form.useForm<ShippingFeeFormValues>()

  useEffect(() => {
    if (!isOpen || !order) return
    form.setFieldsValue({
      shippingFee: Number(order.shippingFee || 0)
    })
  }, [form, isOpen, order])

  const handleFinish = async (values: ShippingFeeFormValues) => {
    const orderId = getOrderId(order)
    if (!orderId) return
    await onSubmit(orderId, Number(values.shippingFee || 0))
  }

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title="Cap nhat phi ship"
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
      <Form<ShippingFeeFormValues> form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Phi ship"
          name="shippingFee"
          rules={[
            { required: true, message: 'Vui long nhap phi ship' }
          ]}
        >
          <InputNumber
            min={0}
            step={1000}
            className="w-full"
            style={{ width: '100%' }}
            formatter={(value) => `${value || 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => Number((value || '0').replace(/,/g, ''))}
          />
        </Form.Item>
      </Form>
    </ModalCommon>
  )
}

export default OrderShippingFeeModal
