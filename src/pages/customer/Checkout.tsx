import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Form, Input, Radio, Row, Select, Spin, Typography, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { LoaderCommon } from '@/components/common'
import { formatCurrency } from '@/utils/formatCurrency'
import useCart from '@/hooks/useCart'
import paymentApi, { type BankInfo, type VnpayCreateRequest } from '@/apis/payment'
import cartApi from '@/apis/cart'
import branchApi from '@/apis/branch'
import type { Branch } from '@/types/api'
import { ROUTES } from '@/constants/constant'
import { stripLocationCodes } from '@/utils/address'
import useVietnamLocations from '@/hooks/useVietnamLocations'

const { Title, Text } = Typography

const Checkout = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm<VnpayCreateRequest>()
  const { cartItems, totalAmount, isLoading, isPricingLoading } = useCart()

  const [banks, setBanks] = useState<BankInfo[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMetaLoading, setIsMetaLoading] = useState(true)
  const {
    provinceOptions,
    districtOptions,
    wardOptions,
    loading: locationLoading,
    fetchProvinces,
    fetchDistricts,
    fetchWards,
    clearDistricts,
    clearWards
  } = useVietnamLocations()

  const hasItems = cartItems.length > 0

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
      message.error('Không tải được thông tin ngân hàng/chi nhánh')
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
    if (!isLoading && !hasItems) {
      navigate(ROUTES.CART, { replace: true })
    }
  }, [hasItems, isLoading, navigate])

  const orderSummary = useMemo(() => (
    <Card title="Tóm tắt đơn hàng" bordered={false} className="shadow-md">
      <div className="space-y-3 max-h-80 overflow-auto pr-2">
        {cartItems.map((item) => {
          const firstImage = item.product.images?.[0]
          const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.imageUrl
          return (
            <div key={item.id} className="flex gap-3">
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
        })}
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
        <Text className="text-gray-600">Tạm tính</Text>
        <Text strong>{formatCurrency(totalAmount)}</Text>
      </div>
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>Phí vận chuyển</span>
        <span>Miễn phí</span>
      </div>
      <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
        <Text strong className="text-lg">Tổng thanh toán</Text>
        <Text strong className="text-xl text-blue-600">{formatCurrency(totalAmount)}</Text>
      </div>
    </Card>
  ), [cartItems, totalAmount])

  const handleSubmit = async (values: VnpayCreateRequest) => {
    if (!hasItems) {
      message.warning('Giỏ hàng trống')
      return
    }

    setIsSubmitting(true)
    try {
      const sanitizedValues: VnpayCreateRequest = {
        ...values,
        shippingAddress: stripLocationCodes(values.shippingAddress)
      }
      await cartApi.validateBeforeCheckout()
      const response = await paymentApi.createVnpayPayment(sanitizedValues)
      const paymentUrl = response.data?.paymentUrl
      if (paymentUrl) {
        window.location.href = paymentUrl
      } else {
        message.error('Không nhận được liên kết thanh toán')
      }
    } catch {
      message.error('Tạo thanh toán VNPay thất bại')
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
            <Card bordered={false} className="shadow-md">
              <Title level={4}>Thông tin giao hàng</Title>
              <Form
                layout="vertical"
                form={form}
                initialValues={{ locale: 'vn' }}
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
                  <Col span={8}>
                    <Form.Item
                      name={['shippingAddress', 'city']}
                      label="Tỉnh/Thành phố"
                      rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố' }]}
                    >
                      <Select
                        placeholder="Chọn tỉnh/thành phố"
                        options={provinceOptions}
                        showSearch
                        filterOption={false}
                        loading={locationLoading.provinces}
                        onSearch={(value) => fetchProvinces(value)}
                        onChange={(value) => {
                          const selected = provinceOptions.find((item) => item.value === value)
                          form.setFieldsValue({
                            shippingAddress: {
                              city: selected?.label || '',
                              district: '',
                              ward: '',
                              provinceCode: value,
                              districtCode: undefined,
                              wardCode: undefined
                            }
                          })
                          clearDistricts()
                          clearWards()
                          if (typeof value === 'number') {
                            fetchDistricts(value, '')
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name={['shippingAddress', 'district']}
                      label="Quận/Huyện"
                      rules={[{ required: true, message: 'Vui lòng nhập quận/huyện' }]}
                    >
                      <Select
                        placeholder="Chọn quận/huyện"
                        options={districtOptions}
                        showSearch
                        filterOption={false}
                        loading={locationLoading.districts}
                        onSearch={(value) => {
                          const provinceCode = form.getFieldValue(['shippingAddress', 'provinceCode']) as number | undefined
                          if (provinceCode) fetchDistricts(provinceCode, value)
                        }}
                        onChange={(value) => {
                          const selected = districtOptions.find((item) => item.value === value)
                          form.setFieldsValue({
                            shippingAddress: {
                              district: selected?.label || '',
                              ward: '',
                              districtCode: value,
                              wardCode: undefined
                            }
                          })
                          clearWards()
                          if (typeof value === 'number') {
                            fetchWards(value, '')
                          }
                        }}
                        disabled={!form.getFieldValue(['shippingAddress', 'provinceCode'])}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name={['shippingAddress', 'ward']}
                      label="Phường/Xã"
                      rules={[{ required: true, message: 'Vui lòng nhập phường/xã' }]}
                    >
                      <Select
                        placeholder="Chọn phường/xã"
                        options={wardOptions}
                        showSearch
                        filterOption={false}
                        loading={locationLoading.wards}
                        onSearch={(value) => {
                          const districtCode = form.getFieldValue(['shippingAddress', 'districtCode']) as number | undefined
                          if (districtCode) fetchWards(districtCode, value)
                        }}
                        onChange={(value) => {
                          const selected = wardOptions.find((item) => item.value === value)
                          form.setFieldsValue({
                            shippingAddress: {
                              ward: selected?.label || '',
                              wardCode: value
                            }
                          })
                        }}
                        disabled={!form.getFieldValue(['shippingAddress', 'districtCode'])}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name={['shippingAddress', 'provinceCode']} hidden>
                  <Input />
                </Form.Item>
                <Form.Item name={['shippingAddress', 'districtCode']} hidden>
                  <Input />
                </Form.Item>
                <Form.Item name={['shippingAddress', 'wardCode']} hidden>
                  <Input />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="branchId"
                      label="Chi nhánh nhận hàng"
                      rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
                    >
                      <Select
                        placeholder="Chọn chi nhánh"
                        options={branches.map((branch) => ({
                          label: `${branch.name} - ${branch.address}`,
                          value: branch._id
                        }))}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="bankCode"
                      label="Ngân hàng VNPay"
                      rules={[{ required: true, message: 'Vui lòng chọn ngân hàng' }]}
                    >
                      <Select
                        placeholder="Chọn ngân hàng"
                        optionLabelProp="label"
                        dropdownRender={(menu) => (
                          <div className="max-h-64 overflow-auto">{menu}</div>
                        )}
                      >
                        {banks.map((bank) => (
                          <Select.Option key={bank.code} value={bank.code} label={bank.name}>
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
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="locale" label="Ngôn ngữ">
                      <Radio.Group>
                        <Radio value="vn">Tiếng Việt</Radio>
                        <Radio value="en">English</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="message" label="Ghi chú">
                      <Input.TextArea rows={2} placeholder="Yêu cầu giao buổi sáng..." />
                    </Form.Item>
                  </Col>
                </Row>

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
                    Thanh toán VNPay
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
