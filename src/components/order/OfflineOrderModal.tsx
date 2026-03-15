import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, Divider, Empty, Input, InputNumber, Select, Spin, Switch, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { ModalCommon, ButtonCommon, LocationSelectGroupOffline } from '@/components/common'
import useAuth from '@/hooks/useAuth'
import { branchApi } from '@/apis/branch'
import storeInventoryApi from '@/apis/storeInventory'
import { userManageApi } from '@/apis/userManage'
import serviceProductApi from '@/apis/serviceProduct'
import { orderApi } from '@/apis/order'
import type { Branch, StoreInventoryRecord } from '@/types/api'
import type { User } from '@/features/user/userTypes'
import type { ServiceProduct } from '@/features/serviceProduct/serviceProductTypes'
import { toast } from '@/utils/toast'
import { extractApiError } from '@/utils/apiError'
import { formatCurrency } from '@/utils/formatCurrency'

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

const OfflineOrderModal = ({ isOpen, onClose, onSuccess }: OfflineOrderModalProps) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [branches, setBranches] = useState<Branch[]>([])
  const [customers, setCustomers] = useState<User[]>([])
  const [inventory, setInventory] = useState<StoreInventoryRecord[]>([])
  const [servicesByProduct, setServicesByProduct] = useState<Record<string, ServiceProduct[]>>({})
  const [branchId, setBranchId] = useState<string>(user?.branch || '')
  const [customerId, setCustomerId] = useState<string>('')
  const [hasDelivery, setHasDelivery] = useState(false)
  const [message, setMessage] = useState('')
  const [address, setAddress] = useState<DeliveryAddress>(EMPTY_ADDRESS)
  const [items, setItems] = useState<OfflineOrderLine[]>([createEmptyLine()])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const resetForm = useCallback(() => {
    setBranchId(user?.branch || '')
    setCustomerId('')
    setHasDelivery(false)
    setMessage('')
    setAddress(EMPTY_ADDRESS)
    setItems([createEmptyLine()])
    setInventory([])
    setServicesByProduct({})
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

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setLoading(true)

    Promise.all([
      isAdmin ? branchApi.getAllBranches({ isActive: true }) : Promise.resolve({ data: [] as Branch[] }),
      userManageApi.getCustomers({ page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' })
    ])
      .then(async ([branchRes, customerRes]) => {
        if (!isMounted) return

        setBranches(branchRes.data || [])
        setCustomers(customerRes.data || [])
        if (branchId) {
          await loadInventory(branchId)
        }
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
  }, [branchId, isAdmin, isOpen, loadInventory])

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
            ward: address.ward,
            provinceCode: address.provinceCode,
            wardCode: address.wardCode
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
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh</label>
                <Select
                  value={branchId || undefined}
                  options={branchOptions}
                  onChange={(value) => setBranchId(value)}
                  placeholder="Chọn chi nhánh"
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng đã đăng ký</label>
              <Select
                value={customerId || undefined}
                options={customerOptions}
                onChange={(value) => setCustomerId(value || '')}
                placeholder="Bỏ trống nếu là khách vãng lai"
                allowClear
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="label"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">Giao hàng tận nơi</p>
                <p className="text-sm text-gray-500">Nếu tắt, đơn sẽ được tính là nhận tại quầy</p>
              </div>
              <Switch checked={hasDelivery} onChange={setHasDelivery} />
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
                      setAddress((prev) => ({
                        ...prev,
                        city: changes.province ?? prev.city,
                        ward: changes.ward ?? prev.ward,
                        provinceCode: changes.provinceCode,
                        wardCode: changes.wardCode
                      }))
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <Divider orientation="left">Sản phẩm</Divider>

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
            <p className="mt-2 text-xs text-gray-500">
              Hệ thống BE sẽ tính chiết khấu và phí giao hàng thực tế khi tạo đơn.
            </p>
          </div>
        </div>
      </Spin>
    </ModalCommon>
  )
}

export default OfflineOrderModal
