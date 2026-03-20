import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { toast } from '@/utils/toast'
import { usePricing, type PricingFormData } from '@/hooks/usePricing'
import productApi from '@/apis/product'
import type { Product } from '@/types/api'
import type { PricingFilter, PricingRule } from '@/features/pricing/pricingTypes'
import type { BulkTierForm } from '@/components/pricing/PricingBulkModal'

let cachedPricingProducts: Product[] | null = null
let cachedPricingProductsPromise: Promise<Product[]> | null = null

const loadPricingProducts = async (): Promise<Product[]> => {
  if (cachedPricingProducts) return cachedPricingProducts
  if (cachedPricingProductsPromise) return cachedPricingProductsPromise

  cachedPricingProductsPromise = productApi
    .getAllProducts()
    .then((response) => {
      cachedPricingProducts = response.data || []
      return cachedPricingProducts
    })
    .catch(() => [])
    .finally(() => {
      cachedPricingProductsPromise = null
    })

  return cachedPricingProductsPromise
}

const bulkTierSchema = z.object({
  minQuantity: z.number().min(1, 'Số lượng tối thiểu không hợp lệ'),
  maxQuantity: z.number().min(1, 'Số lượng tối đa không hợp lệ').nullable().optional(),
  pricePerUnit: z.number().min(0, 'Giá mỗi sản phẩm không hợp lệ'),
  discountPercentage: z.number().min(0, 'Giảm giá không hợp lệ').max(100, 'Giảm giá không hợp lệ').nullable().optional(),
  description: z.string().max(500, 'Mô tả không hợp lệ').optional().or(z.literal(''))
}).superRefine((data, ctx) => {
  if (data.maxQuantity !== null && data.maxQuantity !== undefined) {
    if (data.maxQuantity < data.minQuantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxQuantity'],
        message: 'So luong toi da phai lon hon hoac bang so luong toi thieu'
      })
    }
  }
})

const bulkPricingSchema = z.object({
  productId: z.string().min(1, 'Vui long chon san pham'),
  tiers: z.array(bulkTierSchema).min(1, 'Can it nhat 1 tier')
}).superRefine((data, ctx) => {
  const sorted = [...data.tiers].sort((a, b) => a.minQuantity - b.minQuantity)

  sorted.forEach((tier, index) => {
    if (index < sorted.length - 1 && (tier.maxQuantity === null || tier.maxQuantity === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tiers', index, 'maxQuantity'],
        message: 'Chi tier cuoi cung moi duoc bo trong so luong toi da'
      })
    }
  })

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i]
    const next = sorted[i + 1]
    if (current.maxQuantity !== null && current.maxQuantity !== undefined && next.minQuantity <= current.maxQuantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tiers', i + 1, 'minQuantity'],
        message: 'Khoang so luong bi trung hoac giao nhau'
      })
    }
  }
})

export const usePricingManagement = () => {
  const {
    pricings,
    pagination,
    filter,
    isLoading,
    error,
    fetchPricings,
    handleSetFilter,
    handleClearFilter,
    handleSetSelectedPricing,
    handleClearError,
    createPricing,
    updatePricing,
    deletePricing,
    togglePricingStatus,
    bulkCreatePricing,
    validatePricingForm
  } = usePricing()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedPricingId, setSelectedPricingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<PricingFormData>({
    productId: '',
    minQuantity: 1,
    maxQuantity: null,
    pricePerUnit: 0,
    discountPercentage: undefined,
    description: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const lastFetchParamsRef = useRef<string>('')

  useEffect(() => {
    let active = true

    const loadProducts = async () => {
      const applyIfActive = (fn: () => void) => { if (active) fn() }
      try {
        const productData = await loadPricingProducts()
        applyIfActive(() => setProducts(productData))
      } catch {
        applyIfActive(() => setProducts([]))
      } finally {
        applyIfActive(() => setIsLoadingProducts(false))
      }
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const normalizedSearch = typeof filter.search === 'string' ? filter.search.trim() : ''
    const isActiveFilter = filter.isActive === 'true'
      ? true
      : filter.isActive === 'false'
        ? false
        : undefined

    const filterParams: PricingFilter = {
      page: (filter.page as number) || 1,
      limit: (filter.limit as number) || 10,
      search: normalizedSearch || undefined,
      productId: (filter.productId as string) || undefined,
      isActive: isActiveFilter
    }

    const paramsKey = JSON.stringify(filterParams)
    if (lastFetchParamsRef.current === paramsKey) return
    lastFetchParamsRef.current = paramsKey
    fetchPricings(filterParams)
  }, [filter, fetchPricings])

  useEffect(() => {
    if (!isModalOpen && !isBulkModalOpen && error) {
      handleClearError()
    }
  }, [isModalOpen, isBulkModalOpen, error, handleClearError])

  const productOptions = useMemo(() => products.map((product) => ({
    label: product.name,
    value: product._id
  })), [products])

  const handleOpenModal = useCallback((pricing?: PricingRule) => {
    if (pricing) {
      setFormData({
        productId: pricing.product?._id || '',
        minQuantity: pricing.minQuantity,
        maxQuantity: pricing.maxQuantity ?? null,
        pricePerUnit: pricing.pricePerUnit,
        discountPercentage: pricing.discountPercentage,
        description: pricing.description || ''
      })
      setSelectedPricingId(pricing._id)
      handleSetSelectedPricing(pricing)
      setIsEditMode(true)
    } else {
      setFormData({
        productId: '',
        minQuantity: 1,
        maxQuantity: null,
        pricePerUnit: 0,
        discountPercentage: undefined,
        description: ''
      })
      setSelectedPricingId(null)
      handleSetSelectedPricing(null)
      setIsEditMode(false)
    }
    setFormErrors({})
    setIsModalOpen(true)
  }, [handleSetSelectedPricing])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setFormData({
      productId: '',
      minQuantity: 1,
      maxQuantity: null,
      pricePerUnit: 0,
      discountPercentage: undefined,
      description: ''
    })
    setFormErrors({})
    setIsEditMode(false)
    setSelectedPricingId(null)
    handleSetSelectedPricing(null)
  }, [handleSetSelectedPricing])

  const handleOpenBulkModal = useCallback(() => {
    setIsBulkModalOpen(true)
  }, [])

  const handleCloseBulkModal = useCallback(() => {
    setIsBulkModalOpen(false)
  }, [])

  const handleFormChange = useCallback((field: string, value: string | number | null) => {
    setFormData(prev => {
      const updated: PricingFormData = { ...prev }

      if (field === 'discountPercentage') {
        updated.discountPercentage = value === null ? undefined : (value as number)
      } else if (field === 'maxQuantity') {
        updated.maxQuantity = value === null ? null : (value as number)
      } else {
        (updated as Record<string, unknown>)[field] = value
      }

      // Auto-compute discountPercentage from pricePerUnit relative to product base price
      const productId = field === 'productId' ? (value as string) : prev.productId
      const pricePerUnit = field === 'pricePerUnit' ? (value as number) : prev.pricePerUnit
      const selectedProduct = products.find(p => p._id === productId)

      if (selectedProduct && selectedProduct.price > 0 && field !== 'discountPercentage') {
        if (pricePerUnit > 0 && pricePerUnit < selectedProduct.price) {
          updated.discountPercentage = Math.round((1 - pricePerUnit / selectedProduct.price) * 10000) / 100
        } else {
          updated.discountPercentage = 0
        }
      }

      return updated
    })
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [formErrors, products])

  const handleSubmit = useCallback(async () => {
    const validation = validatePricingForm(formData)
    if (!validation.valid) {
      setFormErrors(validation.errors)
      return
    }

    const selectedProduct = products.find((product) => product._id === formData.productId)
    if (!selectedProduct) {
      setFormErrors((prev) => ({
        ...prev,
        productId: 'Không tìm thấy sản phẩm để đối chiếu giá gốc'
      }))
      return
    }

    if (formData.pricePerUnit > selectedProduct.price) {
      const errorMessage = 'Giá theo bảng giá không được cao hơn giá gốc của sản phẩm'
      setFormErrors((prev) => ({
        ...prev,
        pricePerUnit: errorMessage
      }))
      toast.error(errorMessage)
      return
    }

    setIsSubmitting(true)
    try {
      let result
      const payload = {
        minQuantity: formData.minQuantity,
        maxQuantity: formData.maxQuantity ?? null,
        pricePerUnit: formData.pricePerUnit,
        discountPercentage: formData.discountPercentage,
        description: formData.description || undefined
      }

      if (isEditMode && selectedPricingId) {
        result = await updatePricing(selectedPricingId, payload)
      } else {
        result = await createPricing({
          productId: formData.productId,
          ...payload
        })
      }

      if (result.type.includes('fulfilled')) {
        toast.success(isEditMode ? 'Cập nhật bảng giá thành công' : 'Tạo bảng giá thành công')
        handleCloseModal()
      } else if (result.payload) {
        toast.error(result.payload as string)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isEditMode, selectedPricingId, validatePricingForm, updatePricing, createPricing, handleCloseModal, products])

  const handleDelete = useCallback(async (id: string) => {
    const result = await deletePricing(id)
    if (result.type.includes('fulfilled')) {
      toast.success('Xóa bảng giá thành công')
    } else if (result.payload) {
      toast.error(result.payload as string)
    }
  }, [deletePricing])

  const handleToggleStatus = useCallback(async (id: string) => {
    const result = await togglePricingStatus(id)
    if (result.type.includes('fulfilled')) {
      toast.success('Cập nhật trạng thái bảng giá thành công')
    } else if (result.payload) {
      toast.error(result.payload as string)
    }
  }, [togglePricingStatus])

  const handleBulkSubmit = useCallback(async (productIdValue: string, tiers: BulkTierForm[]) => {
    const parsed = bulkPricingSchema.safeParse({ productId: productIdValue, tiers })
    if (!parsed.success) {
      const messageText = parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ'
      toast.error(messageText)
      return
    }

    const selectedProduct = products.find((product) => product._id === parsed.data.productId)
    if (!selectedProduct) {
      toast.error('Không tìm thấy sản phẩm để đối chiếu giá gốc')
      return
    }

    const invalidTierIndex = parsed.data.tiers.findIndex((tier) => tier.pricePerUnit > selectedProduct.price)
    if (invalidTierIndex !== -1) {
      toast.error(`Giá ở mức ${invalidTierIndex + 1} không được cao hơn giá gốc của sản phẩm`)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        productId: parsed.data.productId,
        tiers: parsed.data.tiers.map((tier) => ({
          minQuantity: tier.minQuantity,
          maxQuantity: tier.maxQuantity ?? null,
          pricePerUnit: tier.pricePerUnit,
          discountPercentage: tier.discountPercentage ?? undefined,
          description: tier.description || undefined
        }))
      }

      const result = await bulkCreatePricing(payload)
      if (result.type.includes('fulfilled')) {
        toast.success('Tạo bảng giá hàng loạt thành công')
        setIsBulkModalOpen(false)
        const isActiveFilter = filter.isActive === 'true'
          ? true
          : filter.isActive === 'false'
            ? false
            : undefined
        const normalizedSearch = typeof filter.search === 'string' ? filter.search.trim() : ''

        fetchPricings({
          page: (filter.page as number) || 1,
          limit: (filter.limit as number) || 10,
          search: normalizedSearch || undefined,
          productId: (filter.productId as string) || undefined,
          isActive: isActiveFilter
        })
      } else if (result.payload) {
        toast.error(result.payload as string)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [bulkCreatePricing, fetchPricings, filter, products, setIsBulkModalOpen])

  return {
    pricings,
    pagination,
    filter,
    isLoading,
    error,
    productOptions,
    isLoadingProducts,
    isModalOpen,
    isBulkModalOpen,
    isEditMode,
    formData,
    formErrors,
    isSubmitting,
    selectedProductBasePrice: products.find(p => p._id === formData.productId)?.price ?? null,
    handleSetFilter,
    handleClearFilter,
    handleOpenModal,
    handleCloseModal,
    handleOpenBulkModal,
    handleCloseBulkModal,
    handleFormChange,
    handleSubmit,
    handleDelete,
    handleToggleStatus,
    handleBulkSubmit
  }
}

export default usePricingManagement
