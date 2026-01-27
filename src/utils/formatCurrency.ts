export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num)
}

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

export const calculateDiscount = (originalPrice: number, salePrice: number): number => {
  if (originalPrice <= 0) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

export const parseCurrency = (currencyString: string): number => {
  const numericString = currencyString.replace(/[^\d]/g, '')
  return parseInt(numericString, 10) || 0
}
