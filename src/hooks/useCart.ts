import { useCallback, useEffect, useMemo, useState } from 'react'
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
              return { id: item.id, data: null }
            }

            try {
              const response = await pricingApi.calculatePrice(resolvedProductId, item.quantity)
              return { id: item.id, data: response.data }
            } catch {
              return { id: item.id, data: null }
            }
          })
        )

        const nextMap: Record<string, PricingCalculation | null> = {}
        results.forEach((result) => {
          nextMap[result.id] = result.data
        })
        applyIfActive(() => setPricingMap(nextMap))
      } finally {
        applyIfActive(() => setIsPricingLoading(false))
      }
    }
  }, [])

  useEffect(() => {
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

    try {
      await cartApi.updateCartItemQuantity(productId, parsed.data)
      setCartItems((prev) =>
        prev.map((item) => (
          item.productId === productId || item.product?._id === productId
            ? { ...item, quantity: parsed.data }
            : item
        ))
      )
      return true
    } catch {
      message.error('Cập nhật số lượng thất bại')
      return false
    }
  }, [])

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
      const pricing = pricingMap[item.id]?.pricing
      const itemTotal = pricing?.totalPrice ?? item.price * item.quantity
      return sum + itemTotal
    }, 0)
  ), [cartItems, pricingMap])

  const getItemPricing = useCallback(
    (itemId: string) => pricingMap[itemId] ?? null,
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
