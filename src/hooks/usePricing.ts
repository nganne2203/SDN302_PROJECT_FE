import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/apps/hooks'
import {
  fetchPricingsThunk,
  fetchPricingByIdThunk,
  createPricingThunk,
  updatePricingThunk,
  deletePricingThunk,
  togglePricingStatusThunk,
  bulkCreatePricingThunk
} from '@/features/pricing/pricingThunks'
import {
  setFilter,
  clearFilter,
  setSelectedPricing,
  clearError
} from '@/features/pricing/pricingSlices'
import type {
  PricingRule,
  PricingFilter,
  CreatePricingPayload,
  UpdatePricingPayload,
  BulkPricingPayload
} from '@/features/pricing/pricingTypes'
import { z } from 'zod'

const pricingValidationSchema = z.object({
  productId: z.string().min(1, 'Vui lòng chọn sản phẩm'),
  minQuantity: z.number().min(1, 'Số lượng tối thiểu phải lớn hơn 0'),
  maxQuantity: z.number().min(1, 'Số lượng tối đa phải lớn hơn 0').nullable().optional(),
  pricePerUnit: z.number().min(0, 'Giá mỗi sản phẩm phải lớn hơn hoặc bằng 0'),
  discountPercentage: z.number().min(0, 'Giảm giá không được nhỏ hơn 0').max(100, 'Giảm giá không được vượt quá 100').optional(),
  description: z.string().max(500, 'Mô tả không được vượt quá 500 ký tự').optional().or(z.literal(''))
}).superRefine((data, ctx) => {
  if (data.maxQuantity !== null && data.maxQuantity !== undefined) {
    if (data.maxQuantity < data.minQuantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxQuantity'],
        message: 'Số lượng tối đa phải lớn hơn hoặc bằng số lượng tối thiểu'
      })
    }
  }
})

export type PricingFormData = z.infer<typeof pricingValidationSchema>

export const usePricing = () => {
  const dispatch = useAppDispatch()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pricingState = useAppSelector((state: any) => state.pricing)

  const {
    pricings = [],
    selectedPricing,
    pagination,
    filter = {},
    isLoading = false,
    error
  } = pricingState || {}

  const fetchPricings = useCallback(
    async (filterData?: PricingFilter) => {
      return dispatch(fetchPricingsThunk(filterData))
    },
    [dispatch]
  )

  const fetchPricingById = useCallback(
    async (id: string) => {
      return dispatch(fetchPricingByIdThunk(id))
    },
    [dispatch]
  )

  const createPricing = useCallback(
    async (data: CreatePricingPayload) => {
      return dispatch(createPricingThunk(data))
    },
    [dispatch]
  )

  const updatePricing = useCallback(
    async (id: string, data: UpdatePricingPayload) => {
      return dispatch(updatePricingThunk({ id, data }))
    },
    [dispatch]
  )

  const deletePricing = useCallback(
    async (id: string) => {
      return dispatch(deletePricingThunk(id))
    },
    [dispatch]
  )

  const togglePricingStatus = useCallback(
    async (id: string) => {
      return dispatch(togglePricingStatusThunk(id))
    },
    [dispatch]
  )

  const bulkCreatePricing = useCallback(
    async (data: BulkPricingPayload) => {
      return dispatch(bulkCreatePricingThunk(data))
    },
    [dispatch]
  )

  const handleSetFilter = useCallback(
    (newFilter: Record<string, unknown>) => {
      dispatch(setFilter(newFilter))
    },
    [dispatch]
  )

  const handleClearFilter = useCallback(() => {
    dispatch(clearFilter())
  }, [dispatch])

  const handleSetSelectedPricing = useCallback(
    (pricing: PricingRule | null) => {
      dispatch(setSelectedPricing(pricing))
    },
    [dispatch]
  )

  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const validatePricingForm = useCallback((data: Record<string, unknown>) => {
    try {
      const validated = pricingValidationSchema.parse(data)
      return { valid: true, data: validated, errors: {} }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        err.issues.forEach((issue) => {
          const path = issue.path.join('.')
          errors[path] = issue.message
        })
        return { valid: false, data: null, errors }
      }
      return { valid: false, data: null, errors: { general: 'Lỗi xác thực' } }
    }
  }, [])

  const pricingsWithDefaults = useMemo(() => pricings.map((pricing: PricingRule) => ({
    key: pricing._id,
    ...pricing
  })), [pricings])

  return {
    pricings: pricingsWithDefaults,
    selectedPricing,
    pagination,
    filter,
    isLoading,
    error,
    togglePricingStatus,

    fetchPricings,
    fetchPricingById,
    createPricing,
    updatePricing,
    deletePricing,
    bulkCreatePricing,
    handleSetFilter,
    handleClearFilter,
    handleSetSelectedPricing,
    handleClearError,

    validatePricingForm
  }
}

export default usePricing
