import type { Image } from '@/types/api'

/**
 * Extract image URL from various product image formats
 * Supports:
 * - Array of Image objects: Image[]
 * - Single Image object: Image
 * - Array of publicId strings: string[]
 */
export const getProductImageUrl = (images: Image[] | Image | string[] | undefined): string | undefined => {
  if (!images) return undefined

  // Handle array of Image objects or strings
  if (Array.isArray(images)) {
    if (images.length === 0) return undefined

    const firstItem = images[0]
    if (typeof firstItem === 'string') {
      // Array of publicId strings (cart API format)
      return `https://res.cloudinary.com/djmbxvsaz/image/upload/${firstItem}.jpg`
    } else if (firstItem && typeof firstItem === 'object' && 'imageUrl' in firstItem) {
      // Array of Image objects (standard format)
      return firstItem.imageUrl
    }
  }
  // Handle single Image object (pricing API format)
  else if (images && typeof images === 'object' && 'imageUrl' in images) {
    return images.imageUrl
  }

  return undefined
}

/**
 * Get placeholder image URL
 */
export const getPlaceholderImageUrl = (): string => '/placeholder.png'