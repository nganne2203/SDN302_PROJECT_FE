import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { message } from 'antd'
import { z } from 'zod'
import cartApi from '@/apis/cart'
import pricingApi from '@/apis/pricing'
import type { CartItem } from '@/types/api'
import type { PricingCalculation } from '@/features/pricing/pricingTypes'
import { STORAGE_KEYS } from '@/constants/constant'
import { getStorage } from '@/utils/storage'

const quantitySchema = z.number().int().min(1, 'So luong khong hop le').max(99, 'So luong khong hop le')

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPricingLoading, setIsPricingLoading] = useState(false)
  const [pricingMap, setPricingMap] = useState<Record<string, PricingCalculation | null>>({})

  // Refs to avoid stale closures and enable debouncing
  const cartItemsRef = useRef<CartItem[]>([])
  const pendingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const pendingQuantitiesRef = useRef<Record<string, number>>({})
  // Prevents the loadPricing effect from re-running on optimistic quantity updates
  const skipNextPricingRef = useRef(false)

  // Keep cartItemsRef in sync so debounce callbacks have fresh data without stale closure
  useEffect(() => {
    cartItemsRef.current = cartItems
  }, [cartItems])

  const loadCart = useCallback(async (isActive: () => boolean) => {
    const applyIfActive = (fn: () => void) => {
      if (isActive()) {
        fn()
      }
    }

    try {
      const token = getStorage(STORAGE_KEYS.ACCESS_TOKEN)
      if (!token) {
        applyIfActive(() => {
          setCartItems([])
          setIsLoading(false)
        })
        return
      }
      const response = await cartApi.getCart()
      applyIfActive(() => setCartItems(response.data?.items || []))
    } catch {
      applyIfActive(() => setCartItems([]))
    } finally {
      applyIfActive(() => setIsLoading(false))
    }
  }, [])

  useEffect(() => {
    let active = true
    const isActive = () => active
    loadCart(isActive)

    return () => {
      active = false
    }
  }, [loadCart])

  const loadPricing = useCallback(async (items: CartItem[], isActive: () => boolean) => {
    const applyIfActive = (fn: () => void) => {
      if (isActive()) {
        fn()
      }
    }

    if (items.length === 0) {
      await Promise.resolve()
      applyIfActive(() => {
        setPricingMap({})
        setIsPricingLoading(false)
      })
    } else {
      await Promise.resolve()
      applyIfActive(() => setIsPricingLoading(true))

      try {
        const results = await Promise.all(
          items.map(async (item) => {
            const resolvedProductId = item.productId || item.product?._id

            if (!resolvedProductId) {
              return { productId: resolvedProductId as string, data: null }
            }

            try {
              const response = await pricingApi.calculatePrice(resolvedProductId, item.quantity)
              return { productId: resolvedProductId as string, data: response.data }
            } catch {
              return { productId: resolvedProductId as string, data: null }
            }
          })
        )

        const nextMap: Record<string, PricingCalculation | null> = {}
        results.forEach((result) => {
          if (result.productId) nextMap[result.productId] = result.data
        })
        applyIfActive(() => setPricingMap(nextMap))
      } finally {
        applyIfActive(() => setIsPricingLoading(false))
      }
    }
  }, [])

  useEffect(() => {
    // Skip full reprice when cartItems changed only due to an optimistic quantity update.
    // The debounced updateQuantity handler will reprice just the affected item instead.
    if (skipNextPricingRef.current) {
      skipNextPricingRef.current = false
      return
    }
    let active = true
    const isActive = () => active
    loadPricing(cartItems, isActive)

    return () => {
      active = false
    }
  }, [cartItems, loadPricing])

  const updateQuantity = useCallback(async (productId: string, quantity: number | null) => {
    const parsed = quantitySchema.safeParse(quantity)
    if (!parsed.success) {
      message.error(parsed.error.issues[0]?.message || 'Số lượng không hợp lệ')
      return false
    }
    const newQty = parsed.data

    // 1. Optimistic update — reflect new quantity in UI immediately, no API call yet
    skipNextPricingRef.current = true
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId || item.product?._id === productId
          ? { ...item, quantity: newQty }
          : item
      )
    )

    // 2. Debounce the actual API call — cancel previous pending call for this product
    pendingQuantitiesRef.current[productId] = newQty
    if (pendingTimersRef.current[productId]) {
      clearTimeout(pendingTimersRef.current[productId])
    }

    pendingTimersRef.current[productId] = setTimeout(async () => {
      const finalQty = pendingQuantitiesRef.current[productId]
      if (finalQty === undefined) return
      delete pendingTimersRef.current[productId]
      delete pendingQuantitiesRef.current[productId]

      try {
        await cartApi.updateCartItemQuantity(productId, finalQty)
        // 3. Reprice only the changed item, not the whole cart
        const item = cartItemsRef.current.find(
          (i) => i.productId === productId || i.product?._id === productId
        )
        if (item) {
          pricingApi.calculatePrice(productId, finalQty)
            .then((res) => setPricingMap((prev) => ({ ...prev, [productId]: res.data })))
            .catch(() => setPricingMap((prev) => ({ ...prev, [productId]: null })))
        }
      } catch {
        message.error('Cập nhật số lượng thất bại')
        // Rollback: reload fresh cart state from server
        let active = true
        loadCart(() => active)
        setTimeout(() => { active = false }, 10000)
      }
    }, 600)

    return true
  }, [loadCart])

  const removeItem = useCallback(async (productId: string) => {
    try {
      await cartApi.removeFromCart(productId)
      setCartItems((prev) => prev.filter(
        (item) => item.productId !== productId && item.product?._id !== productId
      ))
      message.success('Đã xóa sản phẩm khỏi giỏ hàng')
      return true
    } catch {
      message.error('Xóa sản phẩm thất bại')
      return false
    }
  }, [])

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  const totalAmount = useMemo(() => (
    cartItems.reduce((sum, item) => {
      const pid = item.productId || item.product?._id
      const pricing = pid ? pricingMap[pid]?.pricing : undefined
      const itemTotal = pricing?.totalPrice ?? item.price * item.quantity
      return sum + itemTotal
    }, 0)
  ), [cartItems, pricingMap])

  // pricingMap is keyed by productId
  const getItemPricing = useCallback(
    (productId: string) => pricingMap[productId] ?? null,
    [pricingMap]
  )

  return {
    cartItems,
    isLoading,
    isPricingLoading,
    totalItems,
    totalAmount,
    getItemPricing,
    updateQuantity,
    removeItem
  }
}

export default useCart
