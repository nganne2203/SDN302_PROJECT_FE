import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Spin,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  EnvironmentOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LoaderCommon } from '@/components/common';
import { formatCurrency } from '@/utils/formatCurrency';
import { getProductImageUrl } from '@/utils/imageHelper';
import useCart from '@/hooks/useCart';
import useUser from '@/hooks/useUser';
import paymentApi, {
  type BankInfo,
  type VnpayCreateRequest,
} from '@/apis/payment';
import { orderApi, type CreateCodOrderRequest } from '@/apis/order';
import cartApi from '@/apis/cart';
import branchApi from '@/apis/branch';
import type { Branch, Product } from '@/types/api';
import type { Address } from '@/features/user/userTypes';
import { ROUTES } from '@/constants/constant';
import { stripLocationCodes } from '@/utils/address';
import useVietnamLocationsOffline from '@/hooks/useVietnamLocationsOffline';
import type { ServiceProduct } from '@/features/serviceProduct/serviceProductTypes';
import type { PricingCalculation } from '@/features/pricing/pricingTypes';

const { Title, Text } = Typography;

interface BuyNowState {
  product: Product;
  quantity: number;
  serviceIds: string[];
  services: ServiceProduct[];
  pricingData: PricingCalculation | null;
}

const INTER_PROVINCE_FEE = 50000;
const INTRA_PROVINCE_FEE = 0;

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/** Mirror the backend isInterProvince logic: check if any branch address contains the customer city */
const estimateShippingFee = (city: string, branches: Branch[]): number => {
  if (!city || branches.length === 0) return INTRA_PROVINCE_FEE;
  const normalizedCity = normalizeText(city);
  const hasSameProvinceBranch = branches.some((b) =>
    normalizeText(b.address).includes(normalizedCity),
  );
  return hasSameProvinceBranch ? INTRA_PROVINCE_FEE : INTER_PROVINCE_FEE;
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const buyNow =
    (location.state as { buyNow?: BuyNowState } | null)?.buyNow ?? null;
  type PaymentMethod = 'cod' | 'vnpay';
  interface CheckoutFormValues extends Omit<VnpayCreateRequest, 'message'> {
    paymentMethod: PaymentMethod;
    message?: string;
  }

  const [form] = Form.useForm<CheckoutFormValues>();
  const { cartItems, totalAmount, isLoading, isPricingLoading } = useCart();
  const { profile, fetchProfile, updateProfile } = useUser();

  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [shippingFee, setShippingFee] = useState<number>(INTRA_PROVINCE_FEE);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<
    number | 'new'
  >('new');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addAddressForm] = Form.useForm();
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const {
    provinceOptions,
    wardOptions,
    loading: locationLoading,
    fetchProvinces,
    fetchDistricts,
    fetchWardsByProvince,
    clearDistricts,
    clearWards,
  } = useVietnamLocationsOffline();

  // Separate location hook for the add-address modal
  const {
    provinceOptions: modalProvinceOptions,
    wardOptions: modalWardOptions,
    loading: modalLocationLoading,
    fetchProvinces: modalFetchProvinces,
    fetchDistricts: modalFetchDistricts,
    fetchWardsByProvince: modalFetchWardsByProvince,
    clearDistricts: modalClearDistricts,
    clearWards: modalClearWards,
  } = useVietnamLocationsOffline();

  const userAddresses = useMemo<Address[]>(
    () => profile?.addresses || [],
    [profile?.addresses],
  );

  const hasItems = cartItems.length > 0;

  const fillFormWithAddress = useCallback(
    (address: Address) => {
      form.setFieldsValue({
        shippingAddress: {
          fullname: address.fullname,
          phone: address.phone,
          addressLine: address.addressLine,
          city: address.city,
          ward: address.ward,
          provinceCode: address.provinceCode,
          wardCode: address.wardCode,
        },
      });
      setShippingFee(estimateShippingFee(address.city, branches));
      // Load location dropdowns for the selected address
      clearDistricts();
      clearWards();
      if (address.provinceCode) {
        fetchDistricts(address.provinceCode, '');
        fetchWardsByProvince(address.provinceCode, '');
      }
    },
    [
      form,
      branches,
      clearDistricts,
      clearWards,
      fetchDistricts,
      fetchWardsByProvince,
    ],
  );

  const clearShippingForm = useCallback(() => {
    form.setFieldsValue({
      shippingAddress: {
        fullname: '',
        phone: '',
        addressLine: '',
        city: '',
        ward: '',
        provinceCode: undefined,
        wardCode: undefined,
      },
    });
    setShippingFee(INTRA_PROVINCE_FEE);
    clearDistricts();
    clearWards();
  }, [form, clearDistricts, clearWards]);

  const handleAddressSelect = useCallback(
    (value: number | 'new') => {
      setSelectedAddressIndex(value);
      if (value === 'new') {
        clearShippingForm();
      } else {
        const address = userAddresses[value];
        if (address) fillFormWithAddress(address);
      }
    },
    [userAddresses, fillFormWithAddress, clearShippingForm],
  );

  // Buy-now totals
  const buyNowServiceTotal =
    buyNow?.services?.reduce((sum, svc) => sum + (svc.price || 0), 0) ?? 0;
  const buyNowUnitPrice =
    buyNow?.pricingData?.pricing?.pricePerUnit ?? buyNow?.product?.price ?? 0;
  const buyNowTotal = buyNow
    ? (buyNow.pricingData?.pricing?.totalPrice ??
        buyNowUnitPrice * buyNow.quantity) +
      buyNowServiceTotal * buyNow.quantity
    : 0;

  const loadMeta = async () => {
    try {
      setIsMetaLoading(true);
      const [bankRes, branchRes] = await Promise.all([
        paymentApi.getBanks(),
        branchApi.getAllBranches({ isActive: true }),
      ]);
      setBanks(bankRes.data || []);
      setBranches(branchRes.data || []);
    } catch {
      message.error('Không tải được dữ liệu thanh toán');
    } finally {
      setIsMetaLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProvinces('');
  }, [fetchProvinces]);

  // Auto-fill default address when profile loads
  useEffect(() => {
    if (userAddresses.length > 0 && branches.length > 0) {
      const defaultIdx = userAddresses.findIndex((a) => a.isDefault);
      const idx = defaultIdx >= 0 ? defaultIdx : 0;
      setSelectedAddressIndex(idx);
      fillFormWithAddress(userAddresses[idx]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddresses, branches]);

  useEffect(() => {
    if (!buyNow && !isLoading && !hasItems) {
      navigate(ROUTES.CART, { replace: true });
    }
  }, [buyNow, hasItems, isLoading, navigate]);

  const orderSummary = useMemo(
    () => (
      <Card title="Tóm tắt đơn hàng" variant="borderless" className="shadow-md">
        <div className="space-y-3 max-h-80 overflow-auto pr-2">
          {(() => {
            const items = buyNow
              ? [
                {
                  product: buyNow.product,
                  quantity: buyNow.quantity,
                  services: buyNow.services,
                  price: buyNowUnitPrice,
                  serviceFee: buyNowServiceTotal,
                  totalPrice: buyNowTotal,
                },
              ]
              : cartItems.map((item) => ({
                product: item.product,
                quantity: item.quantity,
                services: item.services,
                price: item.price,
                serviceFee:
                    typeof item.serviceFee === 'number'
                      ? item.serviceFee
                      : item.services?.reduce(
                        (s, svc) => s + (svc.price || 0),
                        0,
                      ) || 0,
                totalPrice:
                    typeof item.totalPrice === 'number'
                      ? item.totalPrice
                      : item.price * item.quantity +
                        (typeof item.serviceFee === 'number'
                          ? item.serviceFee
                          : item.services?.reduce(
                            (s, svc) => s + (svc.price || 0),
                            0,
                          ) || 0) *
                          item.quantity,
              }));
            return items.map((item, index) => {
              const imageUrl = getProductImageUrl(item.product.images);
              return (
                <div key={index} className="flex gap-3">
                  <img
                    src={imageUrl || undefined}
                    alt={item.product.name}
                    className="w-16 h-16 rounded object-cover bg-gray-100"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.product.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Số lượng: {item.quantity}
                    </div>
                    {item.services && item.services.length > 0 && (
                      <div className="text-xs text-purple-700">
                        Dịch vụ bổ sung:
                        <ul className="list-disc ml-4">
                          {item.services.map((svc, idx) => (
                            <li key={idx}>
                              {(svc.name || svc.service?.name)} (+{formatCurrency(svc.price)})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="text-sm text-blue-600 font-semibold">
                      {formatCurrency(item.totalPrice)}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
          <Text className="text-gray-600">Tạm tính</Text>
          <Text strong>
            {formatCurrency(
              buyNow
                ? buyNowUnitPrice * buyNow.quantity
                : cartItems.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                )
            )}
          </Text>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {/* Phí dịch vụ */}
          <div className="flex justify-between">
            <span>Phí dịch vụ bổ sung</span>
            <span className="text-purple-700 font-medium">
              {formatCurrency(
                buyNow
                  ? buyNowServiceTotal * (buyNow?.quantity ?? 1)
                  : cartItems.reduce((sum, item) => {
                    const fee =
                        typeof item.serviceFee === 'number'
                          ? item.serviceFee * item.quantity
                          : item.services && item.services.length > 0
                            ? item.services.reduce(
                              (s, svc) => s + (svc.price || 0),
                              0
                            ) * item.quantity
                            : 0
                    return sum + fee
                  }, 0)
              )}
            </span>
          </div>

          {/* Phí vận chuyển */}
          <div className="flex justify-between mt-1">
            <span className="flex items-center gap-1">
              Phí vận chuyển
              <Tooltip title="Phí ước tính dựa trên tỉnh/thành phố giao hàng. Số chính xác sẽ được xác nhận khi đặt hàng.">
                <InfoCircleOutlined className="text-gray-400 cursor-help" />
              </Tooltip>
            </span>

            <span
              className={
                shippingFee === 0
                  ? 'text-green-600 font-medium'
                  : 'text-orange-500 font-medium'
              }
            >
              {shippingFee === 0
                ? 'Miễn phí'
                : `+${formatCurrency(shippingFee)}`}
            </span>
          </div>
        </div>
        {shippingFee > 0 && (
          <div className="text-xs text-gray-400 text-right mt-0.5">
            Giao khác tỉnh/thành phố
          </div>
        )}
        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
          <Text strong className="text-lg">
            Tổng thanh toán
          </Text>
          <Text strong className="text-xl text-blue-600">
            {formatCurrency(
              buyNow
                ? buyNowUnitPrice * buyNow.quantity +
                  buyNowServiceTotal * buyNow.quantity +
                  shippingFee
                : cartItems.reduce((sum, item) => {
                  const itemTotal =
                      typeof item.totalPrice === 'number'
                        ? item.totalPrice
                        : item.price * item.quantity +
                          (typeof item.serviceFee === 'number'
                            ? item.serviceFee * item.quantity
                            : item.services && item.services.length > 0
                              ? item.services.reduce(
                                (s, svc) => s + (svc.price || 0),
                                0,
                              ) * item.quantity
                              : 0);
                  return sum + itemTotal;
                }, 0) + shippingFee,
            )}
          </Text>
        </div>
      </Card>
    ),
    [buyNow, buyNowTotal, cartItems, totalAmount, shippingFee],
  );

  const handleSaveNewAddress = async () => {
    try {
      const values = await addAddressForm.validateFields();
      setIsSavingAddress(true);
      const newAddress: Address = {
        fullname: values.fullname,
        phone: values.phone,
        addressLine: values.addressLine,
        city: values.city,
        ward: values.ward,
        provinceCode: values.provinceCode,
        wardCode: values.wardCode,
        isDefault: userAddresses.length === 0,
      };
      const updatedAddresses = [...userAddresses, newAddress];
      const success = await updateProfile({ addresses: updatedAddresses });
      if (success) {
        message.success('Đã thêm địa chỉ mới');
        setShowAddAddressModal(false);
        addAddressForm.resetFields();
        await fetchProfile();
        // Auto-select the newly added address
        const newIdx = updatedAddresses.length - 1;
        setSelectedAddressIndex(newIdx);
        fillFormWithAddress(newAddress);
      } else {
        message.error('Không thể lưu địa chỉ');
      }
    } catch {
      // validation failed
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSubmit = async (values: CheckoutFormValues) => {
    if (!buyNow && !hasItems) {
      message.warning('Giỏ hàng trống');
      return;
    }

    setIsSubmitting(true);
    try {
      if (buyNow) {
        // Buy-now: set cart to exactly this item before payment
        await cartApi.clearCart();
        const servicesPayload = buyNow.serviceIds.map((serviceId) => ({
          serviceId,
        }));
        await cartApi.addToCart(
          buyNow.product._id,
          buyNow.quantity,
          servicesPayload,
        );
      }

      const sanitizedAddress = stripLocationCodes(values.shippingAddress);

      if (values.paymentMethod === 'cod') {
        await cartApi.validateBeforeCheckout();
        const codPayload: CreateCodOrderRequest = {
          shippingAddress: sanitizedAddress,
          paymentMethod: 'cod',
          message: values.message,
        };
        await orderApi.createCodOrder(codPayload);
        message.success(
          'Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.',
        );
        navigate(ROUTES.ORDERS);
      } else {
        await cartApi.validateBeforeCheckout();
        const vnpayPayload: VnpayCreateRequest = {
          shippingAddress: sanitizedAddress,
          bankCode: values.bankCode,
          locale: values.locale,
          message: values.message,
        };
        const response = await paymentApi.createVnpayPayment(vnpayPayload);
        const paymentUrl = response.data?.paymentUrl;
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          message.error('Không nhận được liên kết thanh toán');
        }
      }
    } catch {
      message.error(
        values.paymentMethod === 'cod'
          ? 'Đặt hàng thất bại'
          : 'Tạo thanh toán VNPay thất bại',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isMetaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoaderCommon size="lg" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Title level={2} className="!mb-0">
            Thanh toán đơn hàng
          </Title>
          <Link
            to={ROUTES.CART}
            className="text-blue-600 hover:underline text-sm"
          >
            Quay lại giỏ hàng
          </Link>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card variant="borderless" className="shadow-md">
              <Title level={4}>Thông tin giao hàng</Title>

              {/* Address Selector */}
              {userAddresses.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Text strong className="flex items-center gap-1">
                      <EnvironmentOutlined /> Chọn địa chỉ đã lưu
                    </Text>
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setShowAddAddressModal(true);
                        modalFetchProvinces('');
                      }}
                      className="!p-0"
                    >
                      Thêm địa chỉ mới
                    </Button>
                  </div>
                  <Select
                    className="w-full"
                    value={selectedAddressIndex}
                    onChange={handleAddressSelect}
                  >
                    {userAddresses.map((addr, idx) => (
                      <Select.Option key={idx} value={idx}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{addr.fullname}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500">{addr.phone}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500 truncate">
                            {addr.addressLine}, {addr.ward}, {addr.city}
                          </span>
                          {addr.isDefault && (
                            <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                              Mặc định
                            </span>
                          )}
                        </div>
                      </Select.Option>
                    ))}
                    <Select.Option value="new">
                      <span className="text-blue-600 font-medium">
                        + Nhập địa chỉ khác
                      </span>
                    </Select.Option>
                  </Select>
                  <Divider className="!my-4" />
                </div>
              )}

              {userAddresses.length === 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                  <Text className="text-yellow-700 text-sm">
                    Bạn chưa có địa chỉ nào được lưu. Thêm địa chỉ để sử dụng
                    cho lần sau.
                  </Text>
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setShowAddAddressModal(true);
                      modalFetchProvinces('');
                    }}
                    className="!p-0"
                  >
                    Thêm địa chỉ
                  </Button>
                </div>
              )}

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
                      rules={[
                        { required: true, message: 'Vui lòng nhập họ tên' },
                      ]}
                    >
                      <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['shippingAddress', 'phone']}
                      label="Số điện thoại"
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng nhập số điện thoại',
                        },
                      ]}
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
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng nhập tỉnh/thành phố',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn tỉnh/thành phố"
                        options={provinceOptions}
                        showSearch
                        filterOption={(input, option) => {
                          const label = String(option?.label || '');
                          return normalizeText(label).includes(
                            normalizeText(input),
                          );
                        }}
                        loading={locationLoading.provinces}
                        onChange={(value) => {
                          const selected = provinceOptions.find(
                            (item) => item.value === value,
                          );
                          const cityLabel = selected?.label || '';
                          form.setFieldsValue({
                            shippingAddress: {
                              city: cityLabel,
                              ward: '',
                              provinceCode: value,
                              wardCode: undefined,
                            },
                          });
                          setShippingFee(
                            estimateShippingFee(cityLabel, branches),
                          );
                          clearDistricts();
                          clearWards();
                          if (value) {
                            fetchDistricts(value, '');
                            fetchWardsByProvince(value, '');
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['shippingAddress', 'ward']}
                      label="Phường/Xã"
                      rules={[
                        { required: true, message: 'Vui lòng nhập phường/xã' },
                      ]}
                    >
                      <Select
                        placeholder="Chọn phường/xã"
                        options={wardOptions}
                        showSearch
                        filterOption={(input, option) => {
                          const label = String(option?.label || '');
                          return normalizeText(label).includes(
                            normalizeText(input),
                          );
                        }}
                        loading={locationLoading.wards}
                        onSearch={(value) => {
                          const provinceCode = form.getFieldValue([
                            'shippingAddress',
                            'provinceCode',
                          ]);
                          if (provinceCode) {
                            fetchWardsByProvince(provinceCode, value);
                          }
                        }}
                        onChange={(value) => {
                          const selected = wardOptions.find(
                            (item) => item.value === value,
                          );
                          form.setFieldsValue({
                            shippingAddress: {
                              ward: selected?.label || '',
                              wardCode: value,
                            },
                          });
                        }}
                        disabled={
                          !form.getFieldValue([
                            'shippingAddress',
                            'provinceCode',
                          ])
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name={['shippingAddress', 'provinceCode']} hidden>
                  <Input />
                </Form.Item>
                <Form.Item name={['shippingAddress', 'wardCode']} hidden>
                  <Input />
                </Form.Item>

                <Form.Item
                  name="paymentMethod"
                  label="Phương thức thanh toán"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn phương thức thanh toán',
                    },
                  ]}
                >
                  <Radio.Group
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <Radio value="cod">
                      <span className="font-medium">
                        Thanh toán khi nhận hàng (COD)
                      </span>
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
                        rules={[
                          {
                            required: paymentMethod === 'vnpay',
                            message: 'Vui lòng chọn ngân hàng',
                          },
                        ]}
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
                                  <img
                                    src={bank.logo}
                                    alt={bank.name}
                                    className="w-6 h-6 object-contain"
                                  />
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
                  <Input.TextArea
                    rows={2}
                    placeholder="Yêu cầu giao buổi sáng..."
                  />
                </Form.Item>

                <div className="flex items-center justify-between mt-4">
                  <Link
                    to={ROUTES.CART}
                    className="text-gray-600 hover:underline text-sm"
                  >
                    Quay lại giỏ hàng
                  </Link>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={isSubmitting}
                    disabled={isPricingLoading}
                  >
                    {paymentMethod === 'cod'
                      ? 'Đặt hàng (COD)'
                      : 'Thanh toán VNPay'}
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

      {/* Add Address Modal */}
      <Modal
        title="Thêm địa chỉ mới"
        open={showAddAddressModal}
        onCancel={() => {
          setShowAddAddressModal(false);
          addAddressForm.resetFields();
        }}
        onOk={handleSaveNewAddress}
        okText="Lưu địa chỉ"
        cancelText="Hủy"
        confirmLoading={isSavingAddress}
        destroyOnClose
      >
        <Form form={addAddressForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullname"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: 'Số điện thoại không hợp lệ',
                  },
                ]}
              >
                <Input placeholder="0912345678" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="addressLine"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input placeholder="123 Nguyễn Trãi" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="Tỉnh/Thành phố"
                rules={[
                  { required: true, message: 'Vui lòng chọn tỉnh/thành phố' },
                ]}
              >
                <Select
                  placeholder="Chọn tỉnh/thành phố"
                  options={modalProvinceOptions}
                  showSearch
                  filterOption={(input, option) => {
                    const label = String(option?.label || '');
                    return normalizeText(label).includes(normalizeText(input));
                  }}
                  loading={modalLocationLoading.provinces}
                  onChange={(value) => {
                    const selected = modalProvinceOptions.find(
                      (item) => item.value === value,
                    );
                    addAddressForm.setFieldsValue({
                      city: selected?.label || '',
                      ward: '',
                      provinceCode: value,
                      wardCode: undefined,
                    });
                    modalClearDistricts();
                    modalClearWards();
                    if (value) {
                      modalFetchDistricts(value, '');
                      modalFetchWardsByProvince(value, '');
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ward"
                label="Phường/Xã"
                rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
              >
                <Select
                  placeholder="Chọn phường/xã"
                  options={modalWardOptions}
                  showSearch
                  filterOption={(input, option) => {
                    const label = String(option?.label || '');
                    return normalizeText(label).includes(normalizeText(input));
                  }}
                  loading={modalLocationLoading.wards}
                  onSearch={(value) => {
                    const provinceCode =
                      addAddressForm.getFieldValue('provinceCode');
                    if (provinceCode) {
                      modalFetchWardsByProvince(provinceCode, value);
                    }
                  }}
                  onChange={(value) => {
                    const selected = modalWardOptions.find(
                      (item) => item.value === value,
                    );
                    addAddressForm.setFieldsValue({
                      ward: selected?.label || '',
                      wardCode: value,
                    });
                  }}
                  disabled={!addAddressForm.getFieldValue('provinceCode')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="provinceCode" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="wardCode" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Checkout
