import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

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
import { API_ENDPOINTS, ROUTES } from '@/constants/constant'
import apiClient from '@/services/apiClient'

import type { Branch } from '@/types/api'
import type { ServiceProduct } from '@/features/serviceProduct/serviceProductTypes'
import type { PricingCalculation } from '@/features/pricing/pricingTypes'

import { useAppSelector } from '@/apps/hooks'

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
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [branchStock, setBranchStock] = useState<number | null>(null)

  const [services, setServices] = useState<ServiceProduct[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

  const [quantity, setQuantity] = useState(0)

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
    if (branches.length && !selectedBranchId) {
      setSelectedBranchId(branches[0]._id)
    }
  }, [branches])

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

  /* ===============================
        FETCH STOCK
  =============================== */

  useEffect(() => {
    if (!id || !selectedBranchId) return

    const fetchStock = async () => {
      try {
        setIsStockLoading(true)

        const res = await apiClient.get(
          API_ENDPOINTS.STORE_INVENTORY.BY_PRODUCT(selectedBranchId, id)
        )

        const qty = res?.data?.data?.quantity
        setBranchStock(typeof qty === 'number' ? qty : null)
      } catch (err: any) {
        setBranchStock(err?.response?.status === 404 ? null : 0)
      } finally {
        setIsStockLoading(false)
      }
    }

    fetchStock()
  }, [id, selectedBranchId])

  /* ===============================
        FETCH PRICING
  =============================== */

  useEffect(() => {
    if (!id) return

    const fetchPricing = async () => {
      try {
        setIsPricingLoading(true)

        const res = await pricingApi.calculatePrice(id, quantity)
        setPricingData(res.data)
      } catch {
        setPricingData(null)
      } finally {
        setIsPricingLoading(false)
      }
    }

    fetchPricing()
  }, [id, quantity])

  /* ===============================
        FIX QUANTITY > STOCK
  =============================== */

  useEffect(() => {
    if (branchStock !== null && quantity > branchStock) {
      setQuantity(branchStock)
    }
  }, [branchStock])

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
  };

  /* ===============================
        ADD TO CART
  =============================== */

  const handleAddToCart = async (productId: string, qty: number) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return;
    }

    try {
      const servicesPayload = selectedServiceIds.map((id) => ({
        serviceId: id
      }))
      // Nếu quantity đang là 0 thì set thành 1
      if (quantity === 0) setQuantity(1)
      await cartApi.addToCart(productId, qty === 0 ? 1 : qty, servicesPayload)
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
          onBranchChange={setSelectedBranchId}
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
};

export default ProductDetailPage
