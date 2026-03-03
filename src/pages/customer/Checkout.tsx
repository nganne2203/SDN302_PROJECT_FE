import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Form, Input, Radio, Row, Select, Spin, Tooltip, Typography, message } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LoaderCommon } from '@/components/common'
import { formatCurrency } from '@/utils/formatCurrency'
import { getProductImageUrl } from '@/utils/imageHelper'
import useCart from '@/hooks/useCart'
import paymentApi, { type BankInfo, type VnpayCreateRequest } from '@/apis/payment'
import { orderApi, type CreateCodOrderRequest } from '@/apis/order'
import cartApi from '@/apis/cart'
import branchApi from '@/apis/branch'
import type { Branch, Product } from '@/types/api'
import { ROUTES } from '@/constants/constant'
import { stripLocationCodes } from '@/utils/address'
import useVietnamLocationsOffline from '@/hooks/useVietnamLocationsOffline'
import type { ServiceProduct } from '@/features/serviceProduct/serviceProductTypes'
import type { PricingCalculation } from '@/features/pricing/pricingTypes'

const { Title, Text } = Typography

interface BuyNowState {
  product: Product
  quantity: number
  serviceIds: string[]
  services: ServiceProduct[]
  pricingData: PricingCalculation | null
}

const INTER_PROVINCE_FEE = 50000
const INTRA_PROVINCE_FEE = 0

const normalizeText = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()

/** Mirror the backend isInterProvince logic: check if any branch address contains the customer city */
const estimateShippingFee = (city: string, branches: Branch[]): number => {
  if (!city || branches.length === 0) return INTRA_PROVINCE_FEE
  const normalizedCity = normalizeText(city)
  const hasSameProvinceBranch = branches.some((b) =>
    normalizeText(b.address).includes(normalizedCity)
  )
  return hasSameProvinceBranch ? INTRA_PROVINCE_FEE : INTER_PROVINCE_FEE
}

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const buyNow = (location.state as { buyNow?: BuyNowState } | null)?.buyNow ?? null
  type PaymentMethod = 'cod' | 'vnpay'
  interface CheckoutFormValues extends Omit<VnpayCreateRequest, 'message'> {
    paymentMethod: PaymentMethod
    message?: string
  }

  const [form] = Form.useForm<CheckoutFormValues>()
  const { cartItems, totalAmount, isLoading, isPricingLoading } = useCart()

  const [banks, setBanks] = useState<BankInfo[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [shippingFee, setShippingFee] = useState<number>(INTRA_PROVINCE_FEE)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMetaLoading, setIsMetaLoading] = useState(true)
  const {
    provinceOptions,
    districtOptions,
    wardOptions,
    loading: locationLoading,
    fetchProvinces,
    fetchDistricts,
    fetchWardsByProvince,
    clearDistricts,
    clearWards
  } = useVietnamLocationsOffline()

  const hasItems = cartItems.length > 0

  // Buy-now totals
  const buyNowServiceTotal = buyNow?.services?.reduce((sum, svc) => sum + (svc.price || 0), 0) ?? 0
  const buyNowUnitPrice = buyNow?.pricingData?.pricing?.pricePerUnit ?? buyNow?.product?.price ?? 0
  const buyNowTotal = buyNow
    ? (buyNow.pricingData?.pricing?.totalPrice ?? buyNowUnitPrice * buyNow.quantity) + buyNowServiceTotal * buyNow.quantity
    : 0

  const loadMeta = async () => {
    try {
      setIsMetaLoading(true)
      const [bankRes, branchRes] = await Promise.all([
        paymentApi.getBanks(),
        branchApi.getAllBranches({ isActive: true })
      ])
      setBanks(bankRes.data || [])
      setBranches(branchRes.data || [])
    } catch {
      message.error('Không tải được dữ liệu thanh toán')
    } finally {
      setIsMetaLoading(false)
    }
  }

  useEffect(() => {
    loadMeta()
  }, [])

  useEffect(() => {
    fetchProvinces('')
  }, [fetchProvinces])

  useEffect(() => {
    if (!buyNow && !isLoading && !hasItems) {
      navigate(ROUTES.CART, { replace: true })
    }
  }, [buyNow, hasItems, isLoading, navigate])

  const orderSummary = useMemo(() => (
    <Card title="Tóm tắt đơn hàng" variant="borderless" className="shadow-md">
      <div className="space-y-3 max-h-80 overflow-auto pr-2">
        {buyNow ? (
          <div className="flex gap-3">
            <img
              src={getProductImageUrl(buyNow.product.images) || undefined}
              alt={buyNow.product.name}
              className="w-16 h-16 rounded object-cover bg-gray-100"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 line-clamp-2">{buyNow.product.name}</div>
              <div className="text-xs text-gray-500">Số lượng: {buyNow.quantity}</div>
              {buyNow.services?.length > 0 && (
                <div className="text-xs text-gray-500">
                  Dịch vụ: {buyNow.services.map((s) => s.name).join(', ')}
                </div>
              )}
              <div className="text-sm text-blue-600 font-semibold">{formatCurrency(buyNowTotal)}</div>
            </div>
          </div>
        ) : (
          cartItems.map((item, index) => {
            const imageUrl = getProductImageUrl(item.product.images)
            const itemKey = item.id || item.productId || item.product?._id || `cart-item-${index}`
            return (
              <div key={itemKey} className="flex gap-3">
                <img
                  src={imageUrl || undefined}
                  alt={item.product.name}
                  className="w-16 h-16 rounded object-cover bg-gray-100"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 line-clamp-2">
                    {item.product.name}
                  </div>
                  <div className="text-xs text-gray-500">Số lượng: {item.quantity}</div>
                  <div className="text-sm text-blue-600 font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
        <Text className="text-gray-600">Tạm tính</Text>
        <Text strong>{formatCurrency(buyNow ? buyNowTotal : totalAmount)}</Text>
      </div>
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span className="flex items-center gap-1">
          Phí vận chuyển
          <Tooltip title="Phí ước tính dựa trên tỉnh/thành phố giao hàng. Số chính xác sẽ được xác nhận khi đặt hàng.">
            <InfoCircleOutlined className="text-gray-400 cursor-help" />
          </Tooltip>
        </span>
        <span className={shippingFee === 0 ? 'text-green-600 font-medium' : 'text-orange-500 font-medium'}>
          {shippingFee === 0 ? 'Miễn phí' : `+${formatCurrency(shippingFee)}`}
        </span>
      </div>
      {shippingFee > 0 && (
        <div className="text-xs text-gray-400 text-right mt-0.5">
          Giao khác tỉnh/thành phố
        </div>
      )}
      <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
        <Text strong className="text-lg">Tổng thanh toán</Text>
        <Text strong className="text-xl text-blue-600">
          {formatCurrency((buyNow ? buyNowTotal : totalAmount) + shippingFee)}
        </Text>
      </div>
    </Card>
  ), [buyNow, buyNowTotal, cartItems, totalAmount, shippingFee])

  const handleSubmit = async (values: CheckoutFormValues) => {
    if (!buyNow && !hasItems) {
      message.warning('Giỏ hàng trống')
      return
    }

    setIsSubmitting(true)
    try {
      if (buyNow) {
        // Buy-now: set cart to exactly this item before payment
        await cartApi.clearCart()
        const servicesPayload = buyNow.serviceIds.map((serviceId) => ({ serviceId }))
        await cartApi.addToCart(buyNow.product._id, buyNow.quantity, servicesPayload)
      }

      const sanitizedAddress = stripLocationCodes(values.shippingAddress)

      if (values.paymentMethod === 'cod') {
        await cartApi.validateBeforeCheckout()
        const codPayload: CreateCodOrderRequest = {
          shippingAddress: sanitizedAddress,
          paymentMethod: 'cod',
          message: values.message
        }
        await orderApi.createCodOrder(codPayload)
        message.success('Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.')
        navigate(ROUTES.ORDERS)
      } else {
        await cartApi.validateBeforeCheckout()
        const vnpayPayload: VnpayCreateRequest = {
          shippingAddress: sanitizedAddress,
          bankCode: values.bankCode,
          locale: values.locale,
          message: values.message
        }
        const response = await paymentApi.createVnpayPayment(vnpayPayload)
        const paymentUrl = response.data?.paymentUrl
        if (paymentUrl) {
          window.location.href = paymentUrl
        } else {
          message.error('Không nhận được liên kết thanh toán')
        }
      }
    } catch {
      message.error(
        values.paymentMethod === 'cod' ? 'Đặt hàng thất bại' : 'Tạo thanh toán VNPay thất bại'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isMetaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoaderCommon size="lg" tip="Đang tải dữ liệu..." />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Title level={2} className="!mb-0">Thanh toán đơn hàng</Title>
          <Link to={ROUTES.CART} className="text-blue-600 hover:underline text-sm">
            Quay lại giỏ hàng
          </Link>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card variant="borderless" className="shadow-md">
              <Title level={4}>Thông tin giao hàng</Title>
              <Form
                layout="vertical"
                form={form}
                initialValues={{ locale: 'vn', paymentMethod: 'cod' }}
                onFinish={handleSubmit}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['shippingAddress', 'fullname']}
                      label="Họ và tên"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                      <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['shippingAddress', 'phone']}
                      label="Số điện thoại"
                      rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                      <Input placeholder="0912345678" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name={['shippingAddress', 'addressLine']}
                  label="Địa chỉ"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                >
                  <Input placeholder="123 Nguyễn Trãi" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['shippingAddress', 'city']}
                      label="Tỉnh/Thành phố"
                      rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố' }]}
                    >
                      <Select
                        placeholder="Chọn tỉnh/thành phố"
                        options={provinceOptions}
                        showSearch
                        filterOption={(input, option) => {
                          const label = String(option?.label || '')
                          return normalizeText(label).includes(normalizeText(input))
                        }}
                        loading={locationLoading.provinces}
                        onChange={(value) => {
                          const selected = provinceOptions.find((item) => item.value === value)
                          const cityLabel = selected?.label || ''
                          form.setFieldsValue({
                            shippingAddress: {
                              city: cityLabel,
                              district: '',
                              ward: '',
                              provinceCode: value,
                              districtCode: undefined,
                              wardCode: undefined
                            }
                          })
                          setShippingFee(estimateShippingFee(cityLabel, branches))
                          clearDistricts()
                          clearWards()
                          if (value) {
                            fetchDistricts(value, '')
                            fetchWardsByProvince(value, '')
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['shippingAddress', 'ward']}
                      label="Phường/Xã"
                      rules={[{ required: true, message: 'Vui lòng nhập phường/xã' }]}
                    >
                      <Select
                        placeholder="Chọn phường/xã"
                        options={wardOptions}
                        showSearch
                        filterOption={(input, option) => {
                          const label = String(option?.label || '')
                          return normalizeText(label).includes(normalizeText(input))
                        }}
                        loading={locationLoading.wards}
                        onSearch={(value) => {
                          const provinceCode = form.getFieldValue(['shippingAddress', 'provinceCode'])
                          if (provinceCode) {
                            fetchWardsByProvince(provinceCode, value)
                          }
                        }}
                        onChange={(value) => {
                          const selected = wardOptions.find((item) => item.value === value)
                          const inferredDistrictCode = value ? String(value).slice(0, 3) : undefined
                          const selectedDistrict = districtOptions.find((item) => item.value === inferredDistrictCode)
                          form.setFieldsValue({
                            shippingAddress: {
                              district: selectedDistrict?.label || '',
                              districtCode: inferredDistrictCode,
                              ward: selected?.label || '',
                              wardCode: value
                            }
                          })
                        }}
                        disabled={!form.getFieldValue(['shippingAddress', 'provinceCode'])}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name={['shippingAddress', 'district']} hidden>
                  <Input />
                </Form.Item>

                <Form.Item name={['shippingAddress', 'provinceCode']} hidden>
                  <Input />
                </Form.Item>
                <Form.Item name={['shippingAddress', 'districtCode']} hidden>
                  <Input />
                </Form.Item>
                <Form.Item name={['shippingAddress', 'wardCode']} hidden>
                  <Input />
                </Form.Item>

                <Form.Item
                  name="paymentMethod"
                  label="Phương thức thanh toán"
                  rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
                >
                  <Radio.Group
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <Radio value="cod">
                      <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                    </Radio>
                    <Radio value="vnpay">
                      <span className="font-medium">Thanh toán VNPay</span>
                    </Radio>
                  </Radio.Group>
                </Form.Item>

                {paymentMethod === 'vnpay' && (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="bankCode"
                        label="Ngân hàng VNPay"
                        rules={[{ required: paymentMethod === 'vnpay', message: 'Vui lòng chọn ngân hàng' }]}
                      >
                        <Select
                          placeholder="Chọn ngân hàng"
                          optionLabelProp="label"
                          popupRender={(menu) => (
                            <div className="max-h-64 overflow-auto">{menu}</div>
                          )}
                        >
                          {banks.map((bank, index) => (
                            <Select.Option
                              key={bank.code || `bank-${index}`}
                              value={bank.code}
                              label={bank.name}
                            >
                              <div className="flex items-center gap-2">
                                {bank.logo && (
                                  <img src={bank.logo} alt={bank.name} className="w-6 h-6 object-contain" />
                                )}
                                <span>{bank.name}</span>
                              </div>
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="locale" label="Ngôn ngữ">
                        <Radio.Group>
                          <Radio value="vn">Tiếng Việt</Radio>
                          <Radio value="en">English</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                <Form.Item name="message" label="Ghi chú">
                  <Input.TextArea rows={2} placeholder="Yêu cầu giao buổi sáng..." />
                </Form.Item>

                <div className="flex items-center justify-between mt-4">
                  <Link to={ROUTES.CART} className="text-gray-600 hover:underline text-sm">
                    Quay lại giỏ hàng
                  </Link>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={isSubmitting}
                    disabled={isPricingLoading}
                  >
                    {paymentMethod === 'cod' ? 'Đặt hàng (COD)' : 'Thanh toán VNPay'}
                  </Button>
                </div>

                {isPricingLoading && (
                  <div className="mt-3 text-xs text-gray-500">
                    Đang tính giá theo số lượng...
                  </div>
                )}
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Spin spinning={isPricingLoading}>{orderSummary}</Spin>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Checkout
