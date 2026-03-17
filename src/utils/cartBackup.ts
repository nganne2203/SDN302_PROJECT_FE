export type CartBackupItem = {
  productId: string
  quantity: number
  services?: { serviceId: string }[]
}

export const BUY_NOW_CART_BACKUP_KEY = 'buyNowCartBackup:v1'

const extractId = (value: unknown): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const anyVal = value as Record<string, unknown>
    const maybeId = anyVal._id ?? anyVal.id
    if (typeof maybeId === 'string') return maybeId
  }
  return ''
}

export const normalizeCartBackupItems = (items: unknown[]): CartBackupItem[] => {
  if (!Array.isArray(items)) return []

  const result: CartBackupItem[] = []

  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = raw as any

    const productId =
      extractId(item.productId) ||
      extractId(item.product?._id) ||
      extractId(item.product?.id) ||
      extractId(item.product)

    const quantity = typeof item.quantity === 'number' ? item.quantity : Number(item.quantity || 0)
    if (!productId || !Number.isFinite(quantity) || quantity <= 0) continue

    const services = Array.isArray(item.services)
      ? item.services
        .map((svc: unknown) => {
          if (!svc || typeof svc !== 'object') return null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const s = svc as any
          const serviceId = extractId(s.serviceId) || extractId(s._id) || extractId(s.id) || extractId(s)
          return serviceId ? { serviceId } : null
        })
        .filter(Boolean)
      : undefined

    result.push({
      productId,
      quantity,
      services: services && services.length > 0 ? (services as { serviceId: string }[]) : undefined
    })
  }

  return result
}

export const saveBuyNowCartBackup = (items: CartBackupItem[]) => {
  try {
    sessionStorage.setItem(BUY_NOW_CART_BACKUP_KEY, JSON.stringify(items))
  } catch {
    // ignore storage failures
  }
}

export const loadBuyNowCartBackup = (): CartBackupItem[] | null => {
  try {
    const raw = sessionStorage.getItem(BUY_NOW_CART_BACKUP_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    return normalizeCartBackupItems(parsed)
  } catch {
    return null
  }
}

export const clearBuyNowCartBackup = () => {
  try {
    sessionStorage.removeItem(BUY_NOW_CART_BACKUP_KEY)
  } catch {
    // ignore
  }
}

