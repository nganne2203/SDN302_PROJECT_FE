/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { useMemo, useState } from 'react'
import { ButtonCommon, LoaderCommon } from '@/components/common'
import type { Branch, Product } from '@/types/api'
import { formatCurrency } from '@/utils/formatCurrency'
import type { ServiceProduct } from '@/features/serviceProduct/serviceProductTypes'
import type { PricingCalculation } from '@/features/pricing/pricingTypes'

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
  isPricingLoading: _isPricingLoading = false,
  onAddToCart,
  onBuyNow
}: ProductDetailProps) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews' | 'warranty'>('description')

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
  const unitPrice = pricingInfo?.pricePerUnit ?? product.price
  const originalUnitPrice = pricingInfo?.originalTotal && quantity > 0
    ? pricingInfo.originalTotal / quantity
    : product.price
  const discountPercent = pricingInfo?.discountPercentage ?? 0
  const productTotal = pricingInfo?.totalPrice ?? product.price * quantity
  const totalPrice = productTotal + serviceTotal * quantity
  const isOutOfStock = !isStockLoading && branchStock !== null && branchStock === 0
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
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 p-6 lg:p-8">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {imageUrls.length > 0 ? (
                <img
                  src={imageUrls[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
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

          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {categoryName}
              </div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 10-2.83-4H12a3 3 0 000 6h.17A3 3 0 0015 8zm-6 8a3 3 0 10-2.83-4H6a3 3 0 000 6h.17A3 3 0 009 16zm9 0a3 3 0 10-2.83-4H12a3 3 0 000 6h.17A3 3 0 0018 16z" />
                  </svg>
                </button>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
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
                <span className="text-lg font-semibold text-gray-900 ml-2">
                  {ratingAvg.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-600">
                ({ratingCount} đánh giá)
              </span>
            </div>

            <div className="py-4 border-y border-gray-200 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-blue-600">
                  {formatCurrency(unitPrice)}
                </span>
                {discountPercent > 0 && originalUnitPrice > unitPrice && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(Math.round(originalUnitPrice))}
                    </span>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">Đã bao gồm VAT</p>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {product.material && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-medium">Chất liệu:</span>
                <span>{product.material}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Chọn chi nhánh:</p>
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
                  <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
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
                  <span className='text-gray-400'>Chưa cập nhật</span>
                ) : branchStock > 0 ? (
                  <span className='text-green-600'>Còn hàng ({branchStock} sản phẩm)</span>
                ) : (
                  <span className='text-red-600'>Hết hàng</span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Số lượng:</span>
                <div className={`flex items-center border rounded-lg ${isOutOfStock ? 'border-gray-200 opacity-50' : 'border-gray-300'}`}>
                  <button
                    onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x border-gray-300 font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
                    disabled={isOutOfStock}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                {!isOutOfStock && branchStock !== null && (
                  <span className="text-xs text-gray-500">Tối đa: {branchStock}</span>
                )}
              </div>

              <div className="flex gap-3">
                <ButtonCommon
                  variant="primary"
                  size="lg"
                  className="flex-1 !bg-black !border-black !text-white hover:!bg-gray-900 hover:!border-gray-900 disabled:!bg-gray-400 disabled:!border-gray-400 disabled:cursor-not-allowed"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                </ButtonCommon>
                <ButtonCommon
                  variant="outline"
                  size="lg"
                  className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                >
                  Mua ngay
                </ButtonCommon>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { title: 'Giao hàng nhanh', desc: '2-3 ngày' },
                { title: 'Bảo hành', desc: '12 tháng' },
                { title: 'Đổi trả', desc: '7 ngày' }
              ].map((item) => (
                <div key={item.title} className="border border-gray-200 rounded-lg p-3 text-center text-xs">
                  <div className="font-semibold text-gray-700">{item.title}</div>
                  <div className="text-gray-500">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-purple-200 p-4 space-y-3">
              <div className="flex items-center gap-2 text-purple-700 font-semibold">
                <span>Dịch vụ bổ sung</span>
              </div>
              {isServiceLoading ? (
                <div className="text-sm text-gray-500">Đang tải dịch vụ...</div>
              ) : services.length === 0 ? (
                <div className="text-sm text-gray-500">Chưa có dịch vụ bổ sung</div>
              ) : (
                <div className="space-y-3">
                  {services.map((svc) => (
                    <label key={svc._id} className="flex items-start gap-3 border border-gray-200 rounded-lg p-3">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selectedServiceIds.includes(svc._id)}
                        onChange={() => onToggleService(svc._id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-gray-900">{svc.name}</div>
                          <div className="text-purple-600 font-semibold">
                            +{formatCurrency(svc.price)}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{svc.description}</p>
                        <span className="inline-block mt-2 text-[10px] uppercase px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                          {svc.type}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Giá sản phẩm:</span>
                <span>{formatCurrency(productTotal)}</span>
              </div>
              {discountPercent > 0 && pricingInfo && (
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
              <div className="flex justify-between font-semibold text-blue-600">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          {[
            { key: 'description', label: 'Mô tả' },
            { key: 'specs', label: 'Thông số kỹ thuật' },
            { key: 'reviews', label: `Đánh giá (${ratingCount})` },
            { key: 'warranty', label: 'Chính sách bảo hành' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeTab === tab.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pt-4 text-sm text-gray-600 leading-relaxed">
          {activeTab === 'description' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Chi tiết sản phẩm</h3>
              <p>{product.description}</p>
            </div>
          )}
          {activeTab === 'specs' && (
            <div className="space-y-2">
              <div><span className="font-medium text-gray-700">Chất liệu:</span> {product.material || 'Đang cập nhật'}</div>
              <div><span className="font-medium text-gray-700">Danh mục:</span> {categoryName}</div>
              <div><span className="font-medium text-gray-700">Slug:</span> {product.slug}</div>
              <div>
                <span className="font-medium text-gray-700">Thiết bị tương thích:</span>{' '}
                {product.compatibility && product.compatibility.length > 0
                  ? product.compatibility.map((c: { name: string } | string) => typeof c === 'string' ? c : c.name).join(', ')
                  : 'Đang cập nhật'}
              </div>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div>
              <p>Chưa có đánh giá chi tiết. Hãy là người đầu tiên đánh giá sản phẩm này.</p>
            </div>
          )}
          {activeTab === 'warranty' && (
            <div>
              <p>Sản phẩm được bảo hành chính hãng 12 tháng tại tất cả các chi nhánh.</p>
            </div>
          )}
        </div>
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <a
                key={relatedProduct._id}
                href={`/products/${relatedProduct._id}`}
                className="group"
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {(() => {
                    const rimgs = Array.isArray(relatedProduct.images)
                      ? relatedProduct.images
                      : relatedProduct.images
                        ? [relatedProduct.images]
                        : []
                    const first = rimgs[0] as string | { imageUrl: string } | undefined
                    const firstUrl = first ? (typeof first === 'string' ? first : first.imageUrl) : null
                    return firstUrl ? (
                    <img
                      src={firstUrl}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )
                  })()}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                  {relatedProduct.name}
                </h3>
                <span className="text-lg font-bold text-blue-600">
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
