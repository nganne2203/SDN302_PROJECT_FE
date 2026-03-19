import { useMemo, useState, useEffect } from 'react'
import { ButtonCommon, LoaderCommon } from '@/components/common'
import { SERVICE_PRODUCT_TYPE_COLORS, getServiceProductTypeLabel } from '@/constants/constant'
import type { Branch, Product } from '@/types/api'
import { formatCurrency } from '@/utils/formatCurrency'
import { getProductImageUrl } from '@/utils/imageHelper'
import type { ServiceProduct } from '@/features/serviceProduct/serviceProductTypes'
import type { PricingCalculation } from '@/features/pricing/pricingTypes'

/* eslint-disable no-unused-vars */
interface ProductDetailProps {
  product: Product
  relatedProducts?: Product[]
  isLoading: boolean
  branches: Branch[]
  selectedBranchId: string | null
  onBranchChange: (branchId: string) => void
  branchStock: number | null
  isStockLoading: boolean
  services: ServiceProduct[]
  selectedServiceIds: string[]
  onToggleService: (serviceId: string) => void
  isServiceLoading: boolean
  quantity: number
  onQuantityChange: (nextQuantity: number) => void
  selectedServices: ServiceProduct[]
  pricingData?: PricingCalculation | null
  isPricingLoading?: boolean // reserved for future use
  onAddToCart?: (productId: string, quantity: number, serviceIds: string[]) => void
  onBuyNow?: (productId: string, quantity: number, serviceIds: string[]) => void
}

const ProductDetail = ({
  product,
  relatedProducts,
  isLoading,
  branches,
  selectedBranchId,
  onBranchChange,
  branchStock,
  isStockLoading,
  services,
  selectedServiceIds,
  onToggleService,
  isServiceLoading,
  quantity,
  onQuantityChange,
  selectedServices,
  pricingData,
  onAddToCart,
  onBuyNow
}: ProductDetailProps) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantityInput, setQuantityInput] = useState(String(quantity))

  useEffect(() => {
    setQuantityInput(String(quantity))
  }, [quantity])
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description')

  const imageUrls = useMemo(() => {
    const imgs = Array.isArray(product.images)
      ? product.images
      : product.images
        ? [product.images]
        : []
    return (imgs as Array<string | { imageUrl: string }>)
      .map((img) => (typeof img === 'string' ? img : img.imageUrl))
      .filter(Boolean) as string[]
  }, [product.images])

  const categoryName = product.category?.name || 'Chưa phân loại'
  const ratingAvg = product.ratingAvg || 0
  const ratingCount = product.ratingCount || 0
  const serviceTotal = selectedServices.reduce((sum, svc) => sum + (svc.price || 0), 0)
  const pricingInfo = pricingData?.pricing
  const pricingQuantity = pricingData?.quantity && pricingData.quantity > 0 ? pricingData.quantity : 1
  const unitPrice = pricingInfo?.pricePerUnit ?? product.price
  const originalUnitPrice = pricingInfo?.originalTotal
    ? pricingInfo.originalTotal / pricingQuantity
    : product.price
  const discountPercent = pricingInfo?.discountPercentage ?? 0
  const hasDiscount = discountPercent > 0 && unitPrice < originalUnitPrice
  const productTotal = quantity > 0 ? (pricingInfo?.totalPrice ?? product.price * quantity) : 0
  const totalPrice = productTotal + serviceTotal * quantity
  const isOutOfStock = !isStockLoading && selectedBranchId !== null && (branchStock === null || branchStock === 0)
  const maxQuantity = branchStock !== null && branchStock > 0 ? branchStock : 99
  const selectedBranch = branches.find((branch) => branch._id === selectedBranchId)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoaderCommon size="lg" />
      </div>
    )
  }

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product._id, quantity, selectedServiceIds)
    }
  }

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product._id, quantity, selectedServiceIds)
    }
  }

  return (
    <div className="space-y-6 lg:space-y-7">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5 lg:gap-6 p-4 lg:p-6">
          <div className="space-y-3">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {imageUrls.length > 0 ? (
                <img
                  src={imageUrls[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {imageUrls.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {categoryName}
              </div>
            </div>

            <h1 className="text-2xl lg:text-[28px] font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(ratingAvg)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-base font-semibold text-gray-900 ml-1.5">
                  {ratingAvg.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                ({ratingCount} đánh giá)
              </span>
            </div>

            <div className="py-3 border-y border-gray-200 space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl font-bold text-blue-600">
                  {formatCurrency(unitPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xs text-gray-400 line-through">
                      {formatCurrency(Math.round(originalUnitPrice))}
                    </span>
                    <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      -{Math.round(discountPercent)}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">Đã bao gồm VAT</p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {product.material && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-medium">Chất liệu:</span>
                <span>{product.material}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1.5">Chọn chi nhánh:</p>
                <select
                  value={selectedBranchId || ''}
                  onChange={(e) => onBranchChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {selectedBranch && (
                  <div className="mt-2.5 rounded-lg border border-blue-100 bg-blue-50 p-2.5 text-xs">
                    <div className="font-medium text-blue-700">{selectedBranch.name}</div>
                    <div className="text-blue-600">{selectedBranch.address}</div>
                    <div className="text-blue-600">Hotline: 028 2345 6789</div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-700">Tình trạng:</span>
                {isStockLoading ? (
                  <span className='text-gray-500'>Đang kiểm tra tồn kho...</span>
                ) : branchStock === null ? (
                  <span className='text-red-600'>Hết hàng</span>
                ) : branchStock > 0 ? (
                  <span className='text-green-600'>Còn hàng ({branchStock} sản phẩm)</span>
                ) : (
                  <span className='text-red-600'>Hết hàng</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 font-medium">Số lượng:</span>

                <div className={`flex items-center border rounded-lg ${isOutOfStock ? 'border-gray-200 opacity-50' : 'border-gray-300'}`}>

                  <button
                    onClick={() => {
                      const next = Math.max(1, quantity - 1)
                      onQuantityChange(next)
                      setQuantityInput(String(next))
                    }}
                    disabled={isOutOfStock}
                    className="px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors disabled:cursor-not-allowed"
                  >
      -
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={quantityInput}
                    disabled={isOutOfStock}
                    onChange={(e) => {
                      const val = e.target.value

                      if (/^\d*$/.test(val)) {
                        setQuantityInput(val)

                        if (val !== '') {
                          const num = Number(val)
                          if (num >= 1 && num <= maxQuantity) {
                            onQuantityChange(num)
                          }
                        }
                      }
                    }}
                    onBlur={() => {
                      let num = Number(quantityInput)

                      if (!quantityInput || isNaN(num) || num < 1) {
                        num = 1
                      }

                      if (num > maxQuantity) {
                        num = maxQuantity
                      }

                      setQuantityInput(String(num))
                      onQuantityChange(num)
                    }}
                    className="w-14 text-center text-sm border-x border-gray-300 py-1.5 outline-none"
                  />

                  <button
                    onClick={() => {
                      const next = Math.min(maxQuantity, quantity + 1)
                      onQuantityChange(next)
                      setQuantityInput(String(next))
                    }}
                    disabled={isOutOfStock}
                    className="px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors disabled:cursor-not-allowed"
                  >
      +
                  </button>

                </div>

                {!isOutOfStock && branchStock !== null && (
                  <span className="text-xs text-gray-500">
      Tối đa: {branchStock}
                  </span>
                )}
              </div>

              <div className="flex gap-2.5">
                <ButtonCommon
                  variant="primary"
                  size="md"
                  className="flex-1 !bg-black !border-black !text-white hover:!bg-gray-900 hover:!border-gray-900 disabled:!bg-gray-400 disabled:!border-gray-400 disabled:cursor-not-allowed"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || quantity <= 0}
                >
                  {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                </ButtonCommon>
                <ButtonCommon
                  variant="outline"
                  size="md"
                  className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || quantity <= 0}
                >
                  Mua ngay
                </ButtonCommon>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { title: 'Giao hàng nhanh', desc: '2-3 ngày' },
                { title: 'Bảo hành', desc: '12 tháng' },
                { title: 'Đổi trả', desc: '7 ngày' }
              ].map((item) => (
                <div key={item.title} className="border border-gray-200 rounded-lg p-2.5 text-center text-[11px]">
                  <div className="font-semibold text-gray-700">{item.title}</div>
                  <div className="text-gray-500">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-purple-200 p-3 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-700 text-sm font-semibold">
                <span>Dịch vụ bổ sung</span>
              </div>
              {isServiceLoading ? (
                <div className="text-sm text-gray-500">Đang tải dịch vụ...</div>
              ) : services.length === 0 ? (
                <div className="text-sm text-gray-500">Chưa có dịch vụ bổ sung</div>
              ) : (
                <div className="space-y-2.5">
                  {services.map((svc) => (
                    <label key={svc._id} className="flex items-start gap-2.5 border border-gray-200 rounded-lg p-2.5">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={selectedServiceIds.includes(svc._id)}
                        onChange={() => onToggleService(svc._id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-gray-900">{svc.name}</div>
                          <div className="text-sm text-purple-600 font-semibold">
                            +{formatCurrency(svc.price)}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{svc.description}</p>
                        <span
                          className={`inline-block mt-2 text-[10px] uppercase px-2 py-1 rounded-full border ${
                            SERVICE_PRODUCT_TYPE_COLORS[svc.type] || SERVICE_PRODUCT_TYPE_COLORS.other
                          }`}
                        >
                          {getServiceProductTypeLabel(svc.type)}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {quantity > 0 && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Giá sản phẩm:</span>
                  <span>{formatCurrency(productTotal)}</span>
                </div>
                {hasDiscount && pricingInfo && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Tiet kiem:</span>
                    <span>{formatCurrency(pricingInfo.savings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Dịch vụ bổ sung:</span>
                  <span>{formatCurrency(serviceTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Số lượng:</span>
                  <span>{quantity}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-blue-600">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-5">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2.5">
          {[
            { key: 'description', label: 'Mô tả' },
            { key: 'specs', label: 'Thông số kỹ thuật' },
            { key: 'reviews', label: `Đánh giá (${ratingCount})` },
            { key: 'warranty', label: 'Chính sách bảo hành' }
          ].filter((tab) => tab.key === 'description' || tab.key === 'specs').map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                activeTab === tab.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pt-3 text-sm text-gray-600 leading-relaxed">
          {activeTab === 'description' && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Chi tiết sản phẩm</h3>
              <p>{product.description}</p>
            </div>
          )}
          {activeTab === 'specs' && (
            <div className="space-y-2">
              <div><span className="font-medium text-gray-700">Chất liệu:</span> {product.material || 'Đang cập nhật'}</div>
              <div><span className="font-medium text-gray-700">Danh mục:</span> {categoryName}</div>
              <div>
                <span className="font-medium text-gray-700">Thiết bị tương thích:</span>{' '}
                {product.compatibility && product.compatibility.length > 0
                  ? product.compatibility.map((c: { name: string } | string) => typeof c === 'string' ? c : c.name).join(', ')
                  : 'Đang cập nhật'}
              </div>
            </div>
          )}
        </div>
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <a
                key={relatedProduct._id}
                href={`/products/${relatedProduct._id}`}
                className="group"
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2.5">
                  {(() => {
                    const imgUrl = getProductImageUrl(relatedProduct.images)
                    return imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )
                  })()}
                </div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1.5">
                  {relatedProduct.name}
                </h3>
                <span className="text-base font-bold text-blue-600">
                  {formatCurrency(relatedProduct.price)}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
