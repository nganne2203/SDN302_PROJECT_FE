import { useCallback, useEffect, useMemo, useState, type UIEvent } from 'react'
import { Button, Card, Divider, Empty, Input, InputNumber, Select, Spin, Switch, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { ModalCommon, ButtonCommon, LocationSelectGroupOffline } from '@/components/common'
import useAuth from '@/hooks/useAuth'
import { branchApi } from '@/apis/branch'
import storeInventoryApi from '@/apis/storeInventory'
import { userManageApi } from '@/apis/userManage'
import serviceProductApi from '@/apis/serviceProduct'
import { orderApi } from '@/apis/order'
import type { Branch, PaginationMeta, StoreInventoryRecord } from '@/types/api'
import type { User } from '@/features/user/userTypes'
import type { ServiceProduct } from '@/features/serviceProduct/serviceProductTypes'
import { USER_ROLES } from '@/constants/constant'
import { toast } from '@/utils/toast'
import { extractApiError } from '@/utils/apiError'
import { formatCurrency } from '@/utils/formatCurrency'

/* eslint-disable no-unused-vars */
type OfflineOrderLine = {
  productId: string
  quantity: number
  serviceIds: string[]
}

type DeliveryAddress = {
  fullname: string
  phone: string
  addressLine: string
  city: string
  ward: string
  provinceCode?: string
  wardCode?: string
}

interface OfflineOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const EMPTY_ADDRESS: DeliveryAddress = {
  fullname: '',
  phone: '',
  addressLine: '',
  city: '',
  ward: '',
  provinceCode: undefined,
  wardCode: undefined
}

const createEmptyLine = (): OfflineOrderLine => ({
  productId: '',
  quantity: 1,
  serviceIds: []
})

const CUSTOMER_PAGE_SIZE = 10

type CreateCustomerForm = {
  fullname: string
  email: string
  phone: string
  password: string
}

const EMPTY_CREATE_CUSTOMER_FORM: CreateCustomerForm = {
  fullname: '',
  email: '',
  phone: '',
  password: ''
}

const OfflineOrderModal = ({ isOpen, onClose, onSuccess }: OfflineOrderModalProps) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [branches, setBranches] = useState<Branch[]>([])
  const [customers, setCustomers] = useState<User[]>([])
  const [customerPagination, setCustomerPagination] = useState<PaginationMeta | null>(null)
  const [inventory, setInventory] = useState<StoreInventoryRecord[]>([])
  const [servicesByProduct, setServicesByProduct] = useState<Record<string, ServiceProduct[]>>({})
  const [branchId, setBranchId] = useState<string>(user?.branch || '')
  const [customerId, setCustomerId] = useState<string>('')
  const [hasDelivery, setHasDelivery] = useState(false)
  const [message, setMessage] = useState('')
  const [address, setAddress] = useState<DeliveryAddress>(EMPTY_ADDRESS)
  const [items, setItems] = useState<OfflineOrderLine[]>([createEmptyLine()])
  const [loading, setLoading] = useState(false)
  const [loadingMoreCustomers, setLoadingMoreCustomers] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(false)
  const [createCustomerForm, setCreateCustomerForm] = useState<CreateCustomerForm>(EMPTY_CREATE_CUSTOMER_FORM)
  const [creatingCustomer, setCreatingCustomer] = useState(false)

  const resetForm = useCallback(() => {
    setBranchId(user?.branch || '')
    setCustomerId('')
    setHasDelivery(false)
    setMessage('')
    setAddress(EMPTY_ADDRESS)
    setItems([createEmptyLine()])
    setInventory([])
    setServicesByProduct({})
    setIsCreateCustomerModalOpen(false)
    setCreateCustomerForm(EMPTY_CREATE_CUSTOMER_FORM)
  }, [user?.branch])

  const loadServices = useCallback(async (productId: string) => {
    if (!productId || servicesByProduct[productId]) return

    try {
      const response = await serviceProductApi.getServicesByProduct(productId)
      setServicesByProduct((prev) => ({
        ...prev,
        [productId]: (response.data || []).filter((service) => service.isActive)
      }))
    } catch {
      setServicesByProduct((prev) => ({ ...prev, [productId]: [] }))
    }
  }, [servicesByProduct])

  const loadInventory = useCallback(async (targetBranchId: string) => {
    if (!targetBranchId) {
      setInventory([])
      return
    }

    const response = await storeInventoryApi.getByBranch(targetBranchId, {
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })

    setInventory((response.data || []).filter((item) => item.product?.isActive))
  }, [])

  const loadCustomers = useCallback(async (page: number, append = false) => {
    const response = await userManageApi.getCustomers({
      page,
      limit: CUSTOMER_PAGE_SIZE,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })

    setCustomerPagination(response.pagination)
    setCustomers((prev) => {
      if (!append) {
        return response.data || []
      }

      const existingCustomerIds = new Set(prev.map((customer) => customer._id))
      const nextCustomers = (response.data || []).filter((customer) => !existingCustomerIds.has(customer._id))
      return [...prev, ...nextCustomers]
    })

    return response
  }, [])

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setLoading(true)

    Promise.all([
      isAdmin
        ? branchApi.getAllBranches({ isActive: true })
        : branchId
          ? branchApi.getBranchById(branchId).then((response) => ({ data: [response.data] as Branch[] }))
          : Promise.resolve({ data: [] as Branch[] }),
      loadCustomers(1)
    ])
      .then(async ([branchRes, customerRes]) => {
        if (!isMounted) return

        setBranches(branchRes.data || [])
        setCustomerPagination(customerRes.pagination)
      })
      .catch(() => {
        if (isMounted) {
          toast.error('Không thể tải dữ liệu tạo đơn offline')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [branchId, isAdmin, isOpen, loadCustomers])

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen, resetForm])

  useEffect(() => {
    if (!isOpen) return
    if (!branchId) return

    loadInventory(branchId)
      .then(() => {
        setItems([createEmptyLine()])
      })
      .catch(() => {
        toast.error('Không thể tải tồn kho chi nhánh')
      })
  }, [branchId, isOpen, loadInventory])

  const handleCustomerPopupScroll = async (event: UIEvent<HTMLDivElement>) => {
    if (loadingMoreCustomers || !customerPagination?.hasNextPage) {
      return
    }

    const target = event.currentTarget
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight

    if (distanceToBottom > 16) {
      return
    }

    try {
      setLoadingMoreCustomers(true)
      await loadCustomers(customerPagination.currentPage + 1, true)
    } catch {
      toast.error('Không thể tải thêm khách hàng')
    } finally {
      setLoadingMoreCustomers(false)
    }
  }

  const autofillDeliveryContactFromCustomer = useCallback((selectedCustomer?: User) => {
    if (!hasDelivery || !selectedCustomer) return

    setAddress((prev) => ({
      ...prev,
      fullname: selectedCustomer.fullname || '',
      phone: selectedCustomer.phone || ''
    }))
  }, [hasDelivery])

  const handleCreateCustomer = async () => {
    const fullname = createCustomerForm.fullname.trim()
    const email = createCustomerForm.email.trim().toLowerCase()
    const phone = createCustomerForm.phone.trim()
    const password = createCustomerForm.password

    if (!fullname) {
      toast.error('Vui lòng nhập họ tên khách hàng')
      return
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Email không hợp lệ')
      return
    }

    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      toast.error('Số điện thoại không hợp lệ (10-11 số)')
      return
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    try {
      setCreatingCustomer(true)
      const response = await userManageApi.createUser({
        fullname,
        email,
        phone: phone || undefined,
        password,
        role: USER_ROLES.CUSTOMER
      })

      const createdCustomer = response.data
      setCustomers((prev) => {
        const deduped = prev.filter((customer) => customer._id !== createdCustomer._id)
        return [createdCustomer, ...deduped]
      })
      setCustomerId(createdCustomer._id)
      autofillDeliveryContactFromCustomer(createdCustomer)
      setCreateCustomerForm(EMPTY_CREATE_CUSTOMER_FORM)
      setIsCreateCustomerModalOpen(false)
      toast.success('Tạo khách hàng thành công')
    } catch (error) {
      toast.error(extractApiError(error, 'Không thể tạo khách hàng'))
    } finally {
      setCreatingCustomer(false)
    }
  }

  const inventoryByProductId = useMemo(
    () => Object.fromEntries(inventory.map((item) => [item.product._id, item])),
    [inventory]
  )

  const customerOptions = useMemo(
    () => customers.map((customer) => ({
      label: `${customer.fullname} - ${customer.email}`,
      value: customer._id
    })),
    [customers]
  )

  const branchOptions = useMemo(
    () => branches.map((branch) => ({
      label: branch.name,
      value: branch._id
    })),
    [branches]
  )

  const productOptions = useMemo(
    () => inventory.map((item) => ({
      label: `${item.product.name} - còn ${item.quantity} - ${formatCurrency(item.product.price)}`,
      value: item.product._id
    })),
    [inventory]
  )

  const orderEstimate = useMemo(() => {
    return items.reduce((total, item) => {
      const inventoryRecord = inventoryByProductId[item.productId]
      if (!inventoryRecord) return total

      const serviceTotal = (servicesByProduct[item.productId] || [])
        .filter((service) => item.serviceIds.includes(service._id))
        .reduce((sum, service) => sum + service.price, 0)

      return total + ((inventoryRecord.product.price + serviceTotal) * item.quantity)
    }, 0)
  }, [inventoryByProductId, items, servicesByProduct])

  const updateItem = (index: number, updater: (current: OfflineOrderLine) => OfflineOrderLine) => {
    setItems((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? updater(item) : item
    )))
  }

  const handleProductChange = async (index: number, productId: string) => {
    updateItem(index, () => ({
      productId,
      quantity: 1,
      serviceIds: []
    }))
    await loadServices(productId)
  }

  const validateForm = () => {
    if (!branchId) {
      toast.error('Vui lòng chọn chi nhánh')
      return false
    }

    if (items.length === 0 || items.some((item) => !item.productId)) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm')
      return false
    }

    const invalidQuantity = items.some((item) => {
      const stock = inventoryByProductId[item.productId]?.quantity || 0
      return item.quantity <= 0 || item.quantity > stock
    })

    if (invalidQuantity) {
      toast.error('Số lượng sản phẩm không hợp lệ so với tồn kho')
      return false
    }

    if (hasDelivery) {
      const requiredFields: Array<keyof DeliveryAddress> = ['fullname', 'phone', 'addressLine', 'city', 'ward']
      const missingField = requiredFields.some((field) => !address[field]?.trim())
      if (missingField) {
        toast.error('Vui lòng nhập đầy đủ thông tin giao hàng')
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setSubmitting(true)
      await orderApi.createOfflineOrder({
        type: 'offline',
        branchId,
        customerId: customerId || undefined,
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          services: item.serviceIds.length > 0 ? item.serviceIds : undefined
        })),
        shippingAddress: hasDelivery
          ? {
            fullname: address.fullname,
            phone: address.phone,
            addressLine: address.addressLine,
            city: address.city,
            ward: address.ward
          }
          : undefined,
        paymentMethod: 'cod',
        message: message.trim() || undefined,
        hasDelivery
      })

      toast.success('Tạo đơn offline thành công')
      onClose()
      onSuccess?.()
      resetForm()
    } catch (error) {
      toast.error(extractApiError(error, 'Không thể tạo đơn offline'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <ModalCommon
        isOpen={isOpen}
        onClose={onClose}
        title="Tạo đơn hàng tại quầy"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <ButtonCommon variant="outline" onClick={onClose} disabled={submitting}>
              Hủy
            </ButtonCommon>
            <ButtonCommon variant="primary" onClick={handleSubmit} isLoading={submitting}>
              Tạo đơn COD
            </ButtonCommon>
          </div>
        }
      >
        <Spin spinning={loading}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh</label>
                <Select
                  value={branchId || undefined}
                  options={branchOptions}
                  onChange={(value) => setBranchId(value)}
                  disabled={!isAdmin}
                  placeholder="Chọn chi nhánh"
                  style={{ width: '100%' }}
                />
              </div>

              <div className='w-full'>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label className="block text-sm font-medium text-gray-700">Khách hàng đã đăng ký</label>
                  <Button
                    type="link"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateCustomerModalOpen(true)}
                  >
                    Thêm khách
                  </Button>
                </div>
                <Select
                  value={customerId || undefined}
                  options={customerOptions}
                  onChange={(value) => {
                    const nextCustomerId = value || ''
                    setCustomerId(nextCustomerId)

                    if (!nextCustomerId) return

                    const selectedCustomer = customers.find((customer) => customer._id === nextCustomerId)
                    autofillDeliveryContactFromCustomer(selectedCustomer)
                  }}
                  placeholder="Chọn khách hàng (tùy chọn)"
                  allowClear
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="label"
                  onPopupScroll={handleCustomerPopupScroll}
                  loading={loading && customers.length === 0}
                  notFoundContent={loadingMoreCustomers ? <Spin size="small" /> : undefined}
                />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">Giao hàng tận nơi</p>
                </div>
                <Switch
                  checked={hasDelivery}
                  onChange={(checked) => {
                    setHasDelivery(checked)

                    if (!checked || !customerId) return

                    const selectedCustomer = customers.find((customer) => customer._id === customerId)
                    if (!selectedCustomer) return

                    setAddress((prev) => ({
                      ...prev,
                      fullname: selectedCustomer.fullname || '',
                      phone: selectedCustomer.phone || ''
                    }))
                  }}
                />
              </div>

              {hasDelivery && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Người nhận</label>
                    <Input
                      value={address.fullname}
                      onChange={(event) => setAddress((prev) => ({ ...prev, fullname: event.target.value }))}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <Input
                      value={address.phone}
                      onChange={(event) => setAddress((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="0912345678"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                    <Input
                      value={address.addressLine}
                      onChange={(event) => setAddress((prev) => ({ ...prev, addressLine: event.target.value }))}
                      placeholder="123 Nguyễn Trãi"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <LocationSelectGroupOffline
                      provinceCode={address.provinceCode}
                      wardCode={address.wardCode}
                      onChange={(changes) => {
                        setAddress((prev) => {
                          const next = { ...prev }

                          if ('province' in changes) {
                            next.city = changes.province ?? ''
                          }

                          if ('ward' in changes) {
                            next.ward = changes.ward ?? ''
                          }

                          if ('provinceCode' in changes) {
                            next.provinceCode = changes.provinceCode
                          }

                          if ('wardCode' in changes) {
                            next.wardCode = changes.wardCode
                          }

                          return next
                        })
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Divider>Sản phẩm</Divider>

            {inventory.length === 0 ? (
              <Empty description="Chi nhánh hiện chưa có dữ liệu tồn kho để tạo đơn" />
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => {
                  const stock = inventoryByProductId[item.productId]
                  const availableServices = servicesByProduct[item.productId] || []
                  const linePrice = stock?.product.price || 0
                  const lineServiceTotal = availableServices
                    .filter((service) => item.serviceIds.includes(service._id))
                    .reduce((sum, service) => sum + service.price, 0)

                  return (
                    <Card
                      key={`offline-order-item-${index}`}
                      size="small"
                      extra={items.length > 1 ? (
                        <ButtonCommon
                          variant="ghost"
                          icon={<DeleteOutlined />}
                          onClick={() => setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                        >
                        Xóa
                        </ButtonCommon>
                      ) : null}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm</label>
                          <Select
                            value={item.productId || undefined}
                            options={productOptions}
                            onChange={(value) => handleProductChange(index, value)}
                            placeholder="Chọn sản phẩm"
                            style={{ width: '100%' }}
                            showSearch
                            optionFilterProp="label"
                          />
                          {stock && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Tag color="blue">Còn {stock.quantity}</Tag>
                              <Tag color="green">{formatCurrency(stock.product.price)}</Tag>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                          <InputNumber
                            min={1}
                            max={stock?.quantity || 1}
                            value={item.quantity}
                            onChange={(value) => updateItem(index, (current) => ({
                              ...current,
                              quantity: Number(value || 1)
                            }))}
                            style={{ width: '100%' }}
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dịch vụ kèm theo</label>
                          <Select
                            mode="multiple"
                            value={item.serviceIds}
                            options={availableServices.map((service) => ({
                              label: `${service.name} - ${formatCurrency(service.price)}`,
                              value: service._id
                            }))}
                            onChange={(value) => updateItem(index, (current) => ({
                              ...current,
                              serviceIds: value
                            }))}
                            placeholder="Không bắt buộc"
                            style={{ width: '100%' }}
                            disabled={!item.productId || availableServices.length === 0}
                          />
                        </div>

                        <div className="md:col-span-3 text-right text-sm text-gray-600">
                        Tạm tính dòng này: <span className="font-semibold text-gray-900">{formatCurrency((linePrice + lineServiceTotal) * item.quantity)}</span>
                        </div>
                      </div>
                    </Card>
                  )
                })}

                <ButtonCommon
                  variant="outline"
                  icon={<PlusOutlined />}
                  onClick={() => setItems((prev) => [...prev, createEmptyLine()])}
                >
                Thêm sản phẩm
                </ButtonCommon>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <Input.TextArea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ghi chú cho đơn hàng"
                rows={3}
              />
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span className="text-lg font-semibold text-gray-900">{formatCurrency(orderEstimate)}</span>
              </div>
            </div>
          </div>
        </Spin>
      </ModalCommon>

      <ModalCommon
        isOpen={isCreateCustomerModalOpen}
        onClose={() => {
          if (creatingCustomer) return
          setIsCreateCustomerModalOpen(false)
          setCreateCustomerForm(EMPTY_CREATE_CUSTOMER_FORM)
        }}
        title="Thêm khách hàng"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <ButtonCommon
              variant="outline"
              onClick={() => {
                setIsCreateCustomerModalOpen(false)
                setCreateCustomerForm(EMPTY_CREATE_CUSTOMER_FORM)
              }}
              disabled={creatingCustomer}
            >
              Hủy
            </ButtonCommon>
            <ButtonCommon
              variant="primary"
              onClick={handleCreateCustomer}
              isLoading={creatingCustomer}
            >
              Tạo khách hàng
            </ButtonCommon>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
            <Input
              value={createCustomerForm.fullname}
              onChange={(event) => setCreateCustomerForm((prev) => ({ ...prev, fullname: event.target.value }))}
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              value={createCustomerForm.email}
              onChange={(event) => setCreateCustomerForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="customer@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <Input
              value={createCustomerForm.phone}
              onChange={(event) => setCreateCustomerForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="0912345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <Input.Password
              value={createCustomerForm.password}
              onChange={(event) => setCreateCustomerForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>
        </div>
      </ModalCommon>
    </>
  )
}

export default OfflineOrderModal
