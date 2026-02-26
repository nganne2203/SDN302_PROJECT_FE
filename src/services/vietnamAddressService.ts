import addressData from 'vietnam-address-database'

export interface Province {
  id: string
  province_code: string
  name: string
  short_name: string
  code: string
  place_type: string
  country: string
}

export interface Ward {
  id: string
  ward_code: string
  name: string
  province_code: string
}

export interface WardMapping {
  id: string
  old_ward_code: string
  old_ward_name: string
  old_district_name: string
  old_province_name: string
  new_ward_code: string
  new_ward_name: string
  new_province_name: string
}

class VietnamAddressService {
  private provinces: Province[] = []
  private wards: Ward[] = []

  constructor() {
    this.parseData()
  }

  private parseData() {
    addressData.forEach(item => {
      if (item.type === 'table') {
        if (item.name === 'provinces') {
          this.provinces = item.data as Province[]
        } else if (item.name === 'wards') {
          this.wards = item.data as Ward[]
        }
      }
    })
  }

  getProvinces(search = ''): Province[] {
    if (!search) return this.provinces

    const searchLower = search.toLowerCase()
    return this.provinces.filter(province =>
      province.code.toLowerCase().includes(searchLower)
    )
  }

  getProvinceByCode(provinceCode: string): Province | undefined {
    return this.provinces.find(p => p.province_code === provinceCode)
  }

  // For districts, we'll extract unique district names from wards data
  getDistricts(provinceCode: string, search = ''): Array<{name: string, code: string}> {
    const provinceWards = this.wards.filter(ward => ward.province_code === provinceCode)

    // Extract unique district names from ward names
    // Vietnamese ward names typically follow pattern: "Phường/Xã [Name], [District]"
    const districts = new Map<string, string>()

    provinceWards.forEach(ward => {
      // Try to extract district from ward name patterns
      // This is a simplified approach - you might need more sophisticated parsing
      const wardName = ward.name.toLowerCase()
      let districtName = ''

      // For wards that might contain district info, extract it
      // This is a basic implementation - might need refinement based on actual data
      if (wardName.includes('quận') || wardName.includes('huyện') || wardName.includes('thị xã')) {
        // Try to extract district name from ward context
        // For now, we'll create a synthetic district code and name
        districtName = `District ${ward.ward_code.slice(0, 3)}`
      } else {
        // Fallback: group by first 3 digits of ward_code
        districtName = `Khu vực ${ward.ward_code.slice(0, 3)}`
      }

      if (!districts.has(districtName)) {
        districts.set(districtName, ward.ward_code.slice(0, 3))
      }
    })

    let result = Array.from(districts.entries()).map(([name, code]) => ({
      name,
      code
    }))

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(district =>
        district.name.toLowerCase().includes(searchLower)
      )
    }

    return result
  }

  getWards(districtCode: string, search = ''): Ward[] {
    // Filter wards by district code (first 3 digits of ward_code)
    let filteredWards = this.wards.filter(ward =>
      ward.ward_code.startsWith(districtCode)
    )

    if (search) {
      const searchLower = search.toLowerCase()
      filteredWards = filteredWards.filter(ward =>
        ward.name.toLowerCase().includes(searchLower)
      )
    }

    return filteredWards
  }

  getWardsByProvinceCode(provinceCode: string, search = ''): Ward[] {
    let filteredWards = this.wards.filter(ward => ward.province_code === provinceCode)

    if (search) {
      const searchLower = search.toLowerCase()
      filteredWards = filteredWards.filter(ward =>
        ward.name.toLowerCase().includes(searchLower)
      )
    }

    return filteredWards
  }
}

// Singleton instance
export const vietnamAddressService = new VietnamAddressService()