import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProduct } from '@/hooks/useProduct'
import { useBranch } from '@/hooks/useBranch'
import ProductDetail from '@/components/product/ProductDetail'
import ReviewSection from '@/components/review/ReviewSection'
import { ButtonCommon } from '@/components/common'
import cartApi from '@/apis/cart'
import pricingApi from '@/apis/pricing'
import { toast } from '@/utils/toast'
import { API_ENDPOINTS, ROUTES } from '@/constants/constant'
import apiClient from '@/services/apiClient'
import type { Branch } from '@/types/api'
import type { ServiceProduct } from '@/features/serviceProduct/serviceProductTypes'
import { serviceProductApi } from '@/apis/serviceProduct'
import type { PricingCalculation } from '@/features/pricing/pricingTypes'

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    selectedProduct,
    relatedProducts,
    isLoading,
    fetchProductById,
    fetchRelatedProducts
  } = useProduct()
  const { branches, fetchBranches } = useBranch()
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [branchStock, setBranchStock] = useState<number | null>(null)
  const [isStockLoading, setIsStockLoading] = useState(false)
  const [services, setServices] = useState<ServiceProduct[]>([])
  const [isServiceLoading, setIsServiceLoading] = useState(false)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [pricingData, setPricingData] = useState<PricingCalculation | null>(null)
  const [isPricingLoading, setIsPricingLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProductById(id)
      fetchRelatedProducts(id, 4)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    fetchBranches({ page: 1, limit: 50, isActive: true }, true)
  }, [fetchBranches])

  useEffect(() => {
    if (!selectedBranchId && branches.length > 0) {
      setSelectedBranchId(branches[0]._id)
    }
  }, [branches, selectedBranchId])

  useEffect(() => {
    if (!id) return
    setIsServiceLoading(true)
    serviceProductApi.getServicesByProduct(id)
      .then((res) => {
        const activeServices = res.data.filter((svc) => svc.isActive)
        setServices(activeServices)
      })
      .catch(() => setServices([]))
      .finally(() => setIsServiceLoading(false))
  }, [id])

  useEffect(() => {
    if (!id || !selectedBranchId) return
    setIsStockLoading(true)
    apiClient.get(API_ENDPOINTS.STORE_INVENTORY.BY_PRODUCT(selectedBranchId, id))
      .then((res) => {
        const quantityValue = res?.data?.data?.quantity
        setBranchStock(typeof quantityValue === 'number' ? quantityValue : null)
      })
      .catch(() => setBranchStock(null))
      .finally(() => setIsStockLoading(false))
  }, [id, selectedBranchId])

  useEffect(() => {
    if (!id) return
    setIsPricingLoading(true)
    pricingApi.calculatePrice(id, quantity)
      .then((res) => setPricingData(res.data))
      .catch(() => setPricingData(null))
      .finally(() => setIsPricingLoading(false))
  }, [id, quantity])

  useEffect(() => {
    if (branchStock && quantity > branchStock) {
      setQuantity(branchStock)
    }
  }, [branchStock, quantity])

  const selectedServices = useMemo(
    () => services.filter((svc) => selectedServiceIds.includes(svc._id)),
    [services, selectedServiceIds]
  )

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    )
  }

  const handleAddToCart = async (productId: string, qty: number, serviceIds: string[]) => {
    try {
      const servicesPayload = serviceIds.map((serviceId) => ({ serviceId }))
      await cartApi.addToCart(productId, qty, servicesPayload)
      toast.success('Đã thêm vào giỏ hàng')
      return true
    } catch {
      toast.error('Thêm vào giỏ hàng thất bại')
      return false
    }
  }

  const handleBuyNow = async (productId: string, qty: number, serviceIds: string[]) => {
    const success = await handleAddToCart(productId, qty, serviceIds)
    if (success) {
      navigate(ROUTES.CART)
    }
  }

  if (!selectedProduct && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy sản phẩm
          </h2>
          <ButtonCommon onClick={() => navigate('/products')}>
            Quay lại danh sách sản phẩm
          </ButtonCommon>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <a href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </a>
          <span>/</span>
          <a href="/products" className="hover:text-blue-600 transition-colors">
            Sản phẩm
          </a>
          {selectedProduct && (
            <>
              <span>/</span>
              <span className="text-gray-900 font-medium">
                {selectedProduct.name}
              </span>
            </>
          )}
        </nav>

        {/* Product Detail */}
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            relatedProducts={relatedProducts}
            isLoading={isLoading}
            branches={branches as Branch[]}
            selectedBranchId={selectedBranchId}
            onBranchChange={setSelectedBranchId}
            branchStock={branchStock}
            isStockLoading={isStockLoading}
            services={services}
            selectedServiceIds={selectedServiceIds}
            onToggleService={handleToggleService}
            isServiceLoading={isServiceLoading}
            quantity={quantity}
            onQuantityChange={setQuantity}
            pricingData={pricingData}
            isPricingLoading={isPricingLoading}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            selectedServices={selectedServices}
          />
        )}

        {/* Reviews */}
        {selectedProduct && (
          <ReviewSection
            productId={selectedProduct._id}
            productName={selectedProduct.name}
          />
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage
