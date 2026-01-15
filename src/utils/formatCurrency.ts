/**
 * Format number to Vietnamese currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num)
}

/**
 * Format price with compact notation for large numbers
 */
export const formatCompactPrice = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B ₫`
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ₫`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ₫`
  }
  return formatCurrency(amount)
}

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (originalPrice: number, salePrice: number): number => {
  if (originalPrice <= 0) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  const numericString = currencyString.replace(/[^\d]/g, '')
  return parseInt(numericString, 10) || 0
}
