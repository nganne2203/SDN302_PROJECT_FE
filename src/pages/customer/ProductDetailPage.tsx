import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { useProduct } from '@/hooks/useProduct'
import { useBranch } from '@/hooks/useBranch'

import ProductDetail from '@/components/product/ProductDetail'
import ReviewSection from '@/components/review/ReviewSection'
import { ButtonCommon } from '@/components/common'
import LoginRequiredModal from '@/components/common/LoginRequiredModal'

import cartApi from '@/apis/cart'
import pricingApi from '@/apis/pricing'
import { serviceProductApi } from '@/apis/serviceProduct'

import { toast } from '@/utils/toast'
import { ROUTES } from '@/constants/constant'

import type { Branch } from '@/types/api'
import type { ServiceProduct } from '@/features/serviceProduct/serviceProductTypes'
import type { PricingCalculation } from '@/features/pricing/pricingTypes'

import { useAppSelector } from '@/apps/hooks'

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const {
    selectedProduct,
    relatedProducts,
    isLoading,
    fetchProductById,
    fetchRelatedProducts
  } = useProduct()
  const { branches, fetchBranches } = useBranch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const hasUserSelectedBranchRef = useRef(false)

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [branchStock, setBranchStock] = useState<number | null>(null)

  const [services, setServices] = useState<ServiceProduct[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

  const [quantity, setQuantity] = useState(1)

  const [pricingData, setPricingData] = useState<PricingCalculation | null>(
    null
  )

  const [isStockLoading, setIsStockLoading] = useState(false)
  const [isServiceLoading, setIsServiceLoading] = useState(false)
  const [isPricingLoading, setIsPricingLoading] = useState(false)

  const [showLoginModal, setShowLoginModal] = useState(false)

  /* ===============================
        FETCH PRODUCT
  =============================== */

  useEffect(() => {
    if (!id) return

    hasUserSelectedBranchRef.current = false
    setSelectedBranchId(null)
    setBranchStock(null)
    fetchProductById(id)
    fetchRelatedProducts(id, 4)
  }, [id])

  /* ===============================
        FETCH BRANCHES
  =============================== */

  useEffect(() => {
    fetchBranches({ page: 1, limit: 50, isActive: true }, true)
  }, [])

  useEffect(() => {
    if (!branches.length) return

    const stockByBranch = selectedProduct?.stockByBranch ?? []
    const stockMap = new Map(stockByBranch.map((item) => [item.branch._id, item.quantity]))
    const firstBranchWithStock = branches.find((branch) => (stockMap.get(branch._id) ?? 0) > 0)

    if (!selectedBranchId) {
      setSelectedBranchId(firstBranchWithStock?._id ?? branches[0]._id)
      return
    }

    if (hasUserSelectedBranchRef.current || !firstBranchWithStock) return

    const currentBranchStock = stockMap.get(selectedBranchId) ?? 0
    if (currentBranchStock > 0 || firstBranchWithStock._id === selectedBranchId) return

    setSelectedBranchId(firstBranchWithStock._id)
  }, [branches, selectedBranchId, selectedProduct])

  /* ===============================
        FETCH SERVICES
  =============================== */

  useEffect(() => {
    if (!id) return

    const fetchServices = async () => {
      try {
        setIsServiceLoading(true)

        const res = await serviceProductApi.getServicesByProduct(id)

        setServices(res.data.filter((svc) => svc.isActive))
        setSelectedServiceIds([])
      } catch {
        setServices([])
      } finally {
        setIsServiceLoading(false)
      }
    }

    fetchServices()
  }, [id])

  useEffect(() => {
    if (!selectedBranchId) {
      setBranchStock(null)
      setIsStockLoading(false)
      return
    }

    const matchedStock = selectedProduct?.stockByBranch?.find((item) => item.branch._id === selectedBranchId)
    setBranchStock(matchedStock ? matchedStock.quantity : null)
    setIsStockLoading(false)
  }, [selectedBranchId, selectedProduct])

  /* ===============================
        FETCH PRICING
  =============================== */

  useEffect(() => {
    if (!id) return

    const fetchPricing = async () => {
      try {
        setIsPricingLoading(true)

        const pricingQuantity = Math.max(quantity, 1)
        const res = await pricingApi.calculatePrice(id, pricingQuantity)
        setPricingData(res.data)
      } catch {
        setPricingData(null)
      } finally {
        setIsPricingLoading(false)
      }
    }

    fetchPricing()
  }, [id, quantity])

  useEffect(() => {
    if (location.hash !== '#feedback') return

    const scrollToFeedback = () => {
      document.getElementById('product-feedback')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }

    const timer = window.setTimeout(scrollToFeedback, 150)
    return () => window.clearTimeout(timer)
  }, [location.hash, selectedProduct?._id])

  /* ===============================
        FIX QUANTITY > STOCK
  =============================== */

  useEffect(() => {
    if (branchStock !== null && quantity > branchStock) {
      setQuantity(branchStock)
      return
    }

    if (branchStock !== null && branchStock > 0 && quantity < 1) {
      setQuantity(1)
    }
  }, [branchStock, quantity])

  /* ===============================
        SELECTED SERVICES
  =============================== */

  const selectedServices = useMemo(
    () => services.filter((svc) => selectedServiceIds.includes(svc._id)),
    [services, selectedServiceIds]
  )

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleBranchChange = (branchId: string | null) => {
    hasUserSelectedBranchRef.current = true
    setSelectedBranchId(branchId)
  }

  /* ===============================
        ADD TO CART
  =============================== */

  const handleAddToCart = async (productId: string, qty: number) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    if (qty <= 0) {
      toast.warning('Vui lòng chọn số lượng sản phẩm')
      return
    }
    try {
      const servicesPayload = selectedServiceIds.map((id) => ({
        serviceId: id
      }))
      await cartApi.addToCart(productId, qty, servicesPayload)
      toast.success('Đã thêm vào giỏ hàng')
    } catch {
      toast.error('Thêm vào giỏ hàng thất bại')
    }
  }

  /* ===============================
        BUY NOW
  =============================== */

  const handleBuyNow = (productId: string, qty: number) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    if (qty <= 0) {
      toast.warning('Vui lòng chọn số lượng sản phẩm')
      return
    }
    navigate(ROUTES.CHECKOUT, {
      state: {
        buyNow: {
          product: selectedProduct,
          quantity: qty,
          services: selectedServices,
          serviceIds: selectedServiceIds,
          pricingData
        }
      }
    })
  }

  /* ===============================
        UI STATES
  =============================== */

  if (isLoading || !selectedProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ButtonCommon onClick={() => navigate('/products')}>
          Quay lại sản phẩm
        </ButtonCommon>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProductDetail
          product={selectedProduct}
          relatedProducts={relatedProducts}
          branches={branches as Branch[]}
          selectedBranchId={selectedBranchId}
          onBranchChange={handleBranchChange}
          branchStock={branchStock}
          isStockLoading={isStockLoading}
          services={services}
          selectedServiceIds={selectedServiceIds}
          onToggleService={toggleService}
          isServiceLoading={isServiceLoading}
          quantity={quantity}
          onQuantityChange={setQuantity}
          pricingData={pricingData}
          isPricingLoading={isPricingLoading}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          selectedServices={selectedServices}
        />

        <ReviewSection
          productId={selectedProduct._id}
          productName={selectedProduct.name}
        />
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}

export default ProductDetailPage
