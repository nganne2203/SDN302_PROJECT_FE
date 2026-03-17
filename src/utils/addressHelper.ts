import { vietnamAddressService } from '@/services/vietnamAddressService'

export interface AddressComponents {
  addressLine?: string
  ward?: string
  city?: string
  provinceCode?: string
  wardCode?: string
}

/**
 * Combine address components into a single address string for backend
 */
export const combineAddress = (components: AddressComponents): string => {
  const parts = []

  if (components.addressLine?.trim()) {
    parts.push(components.addressLine.trim())
  }

  if (components.ward?.trim()) {
    parts.push(components.ward.trim())
  }

  if (components.city?.trim()) {
    parts.push(components.city.trim())
  }

  return parts.join(', ')
}

/**
 * Parse a full address string back to components (for editing)
 * This is a best-effort approach since exact parsing is complex
 */
export const parseAddress = (fullAddress: string): AddressComponents => {
  if (!fullAddress) return {}

  const parts = fullAddress.split(',').map(part => part.trim())

  if (parts.length === 1) {
    return { addressLine: parts[0] }
  }

  // Try to match with known provinces/wards
  const provinces = vietnamAddressService.getProvinces()
  const allWards = provinces.flatMap(province =>
    vietnamAddressService.getWardsByProvinceCode(province.province_code)
  )

  const foundProvince = provinces.find(province =>
    parts.some(part =>
      part.toLowerCase().includes(province.name.toLowerCase()) ||
      province.name.toLowerCase().includes(part.toLowerCase())
    )
  )

  const foundWard = allWards.find(ward =>
    parts.some(part =>
      part.toLowerCase().includes(ward.name.toLowerCase()) ||
      ward.name.toLowerCase().includes(part.toLowerCase())
    )
  )

  const result: AddressComponents = {}

  if (foundProvince) {
    result.city = foundProvince.name
    result.provinceCode = foundProvince.province_code

    if (foundWard && foundWard.province_code === foundProvince.province_code) {
      result.ward = foundWard.name
      result.wardCode = foundWard.ward_code
    }
  }

  // The first part is likely the address line if we have other components
  if (result.city || result.ward) {
    const usedParts = [result.city, result.district, result.ward].filter(Boolean)
    const addressParts = parts.filter(part =>
      !usedParts.some(used =>
        part.toLowerCase().includes(used!.toLowerCase()) ||
        used!.toLowerCase().includes(part.toLowerCase())
      )
    )
    result.addressLine = addressParts.join(', ')
  } else {
    // If we can't parse components, treat the whole thing as address line
    result.addressLine = fullAddress
  }

  return result
}