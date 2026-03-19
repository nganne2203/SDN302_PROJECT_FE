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

const extractId = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return undefined
  const anyValue = value as { _id?: unknown; id?: unknown }
  if (typeof anyValue._id === 'string') return anyValue._id
  if (typeof anyValue.id === 'string') return anyValue.id
  return undefined
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPricingLoading, setIsPricingLoading] = useState(false)
  const [pricingMap, setPricingMap] = useState<Record<string, PricingCalculation | null>>({})

  const cartItemsRef = useRef<CartItem[]>([])
  const pendingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const pendingQuantitiesRef = useRef<Record<string, number>>({})
  const skipNextPricingRef = useRef(false)

  useEffect(() => {
    cartItemsRef.current = cartItems
  }, [cartItems])

  const getLineId = useCallback((item: CartItem): string => {
    const anyItem = item as any
    return extractId(anyItem.id) || extractId(anyItem._id) || ''
  }, [])

  const getProductId = useCallback((item: CartItem): string | undefined => {
    const anyItem = item as any
    return extractId(anyItem.productId)
      || extractId(anyItem.product?._id)
      || extractId(anyItem.product?.id)
      || extractId(anyItem.product)
  }, [])

  const loadCart = useCallback(async (isActive: () => boolean) => {
    const applyIfActive = (fn: () => void) => {
      if (isActive()) fn()
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
    return () => { active = false }
  }, [loadCart])

  const loadPricing = useCallback(async (items: CartItem[], isActive: () => boolean) => {
    const applyIfActive = (fn: () => void) => {
      if (isActive()) fn()
    }

    if (items.length === 0) {
      await Promise.resolve()
      applyIfActive(() => {
        setPricingMap({})
        setIsPricingLoading(false)
      })
      return
    }

    await Promise.resolve()
    applyIfActive(() => setIsPricingLoading(true))

    try {
      const results = await Promise.all(
        items.map(async (item) => {
          const lineId = getLineId(item)
          const productId = getProductId(item)
          if (!lineId || !productId) return { lineId, data: null }
          try {
            const response = await pricingApi.calculatePrice(productId, item.quantity)
            return { lineId, data: response.data }
          } catch {
            return { lineId, data: null }
          }
        })
      )

      const nextMap: Record<string, PricingCalculation | null> = {}
      results.forEach((r) => {
        if (r.lineId) nextMap[r.lineId] = r.data
      })
      applyIfActive(() => setPricingMap(nextMap))
    } finally {
      applyIfActive(() => setIsPricingLoading(false))
    }
  }, [getLineId, getProductId])

  useEffect(() => {
    if (skipNextPricingRef.current) {
      skipNextPricingRef.current = false
      return
    }

    let active = true
    const isActive = () => active
    loadPricing(cartItems, isActive)
    return () => { active = false }
  }, [cartItems, loadPricing])

  const updateQuantity = useCallback(async (cartLine: CartItem, quantity: number | null) => {
    const parsed = quantitySchema.safeParse(quantity)
    if (!parsed.success) {
      message.error(parsed.error.issues[0]?.message || 'Số lượng không hợp lệ')
      return false
    }

    const newQty = parsed.data
    const lineId = getLineId(cartLine)
    const productId = getProductId(cartLine)

    if (!lineId) {
      message.error('Không xác định được dòng giỏ hàng (itemId)')
      return false
    }

    skipNextPricingRef.current = true
    setCartItems((prev) => prev.map((it) => (getLineId(it) === lineId ? { ...it, quantity: newQty } : it)))

    pendingQuantitiesRef.current[lineId] = newQty
    if (pendingTimersRef.current[lineId]) clearTimeout(pendingTimersRef.current[lineId])

    pendingTimersRef.current[lineId] = setTimeout(async () => {
      const finalQty = pendingQuantitiesRef.current[lineId]
      delete pendingTimersRef.current[lineId]
      delete pendingQuantitiesRef.current[lineId]

      try {
        if (productId) {
          await cartApi.updateCartItemQuantity(productId, finalQty, { emit: false })

          pricingApi.calculatePrice(productId, finalQty)
            .then((res) => setPricingMap((prev) => ({ ...prev, [lineId]: res.data })))
            .catch(() => setPricingMap((prev) => ({ ...prev, [lineId]: null })))
        } else {
          message.error('Không xác định được sản phẩm (productId)')
          loadCart(() => true)
        }
      } catch {
        message.error('Cập nhật số lượng thất bại')
        let active = true
        loadCart(() => active)
        setTimeout(() => { active = false }, 10000)
      }
    }, 600)

    return true
  }, [getLineId, getProductId, loadCart])

  const removeItem = useCallback(async (cartLine: CartItem) => {
    const lineId = getLineId(cartLine)
    const productId = getProductId(cartLine)

    if (!lineId) {
      message.error('Không xác định được dòng giỏ hàng (itemId)')
      return false
    }

    if (pendingTimersRef.current[lineId]) {
      clearTimeout(pendingTimersRef.current[lineId])
      delete pendingTimersRef.current[lineId]
    }
    delete pendingQuantitiesRef.current[lineId]

    setCartItems((prev) => prev.filter((it) => getLineId(it) !== lineId))
    setPricingMap((prev) => {
      const next = { ...prev }
      delete next[lineId]
      return next
    })

    try {
      await cartApi.removeCartItemById(lineId, { emit: false })
      cartApi.notifyCartChanged({ type: 'add', delta: -1 })
      message.success('Đã xóa sản phẩm khỏi giỏ hàng')
      return true
    } catch {
      // Fallback for older BE (productId only) – may remove all variants of the product.
      if (productId) {
        try {
          await cartApi.removeFromCart(productId, { emit: false })
          cartApi.notifyCartChanged({ type: 'sync' })
          message.success('Đã xóa sản phẩm khỏi giỏ hàng')
          return true
        } catch {
          // fallthrough
        }
      }
      message.error('Xóa sản phẩm thất bại')
      let active = true
      loadCart(() => active)
      setTimeout(() => { active = false }, 10000)
      return false
    }
  }, [getLineId, getProductId, loadCart])

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  const totalAmount = useMemo(() => (
    cartItems.reduce((sum, item) => {
      const lineId = getLineId(item)
      const pricing = lineId ? pricingMap[lineId]?.pricing : undefined
      const itemTotal = pricing?.totalPrice ?? item.price * item.quantity
      return sum + itemTotal
    }, 0)
  ), [cartItems, getLineId, pricingMap])

  const getItemPricing = useCallback(
    (item: CartItem) => {
      const lineId = getLineId(item)
      return lineId ? pricingMap[lineId] ?? null : null
    },
    [getLineId, pricingMap]
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
