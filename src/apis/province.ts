import axios from 'axios'

const provincesClient = axios.create({
  baseURL: '/api/provinces',
  timeout: 15000
})

export interface ProvinceItem {
  code: number
  codename: string
  division_type: string
  name: string
  phone_code?: number
}

export interface DistrictItem {
  code: number
  codename: string
  division_type: string
  name: string
  province_code: number
}

export interface WardItem {
  code: number
  codename: string
  division_type: string
  name: string
  district_code: number
}

interface ProvinceWithDistricts extends ProvinceItem {
  districts?: DistrictItem[]
}

interface DistrictWithWards extends DistrictItem {
  wards?: WardItem[]
}

const filterBySearch = <T extends { name: string }>(items: T[], search = ''): T[] => {
  if (!search) return items
  const keyword = search.trim().toLowerCase()
  if (!keyword) return items
  return items.filter((item) => item.name.toLowerCase().includes(keyword))
}

export const provinceApi = {
  listProvinces: async (search = ''): Promise<ProvinceItem[]> => {
    const response = await provincesClient.get<ProvinceItem[]>('/p/', {
      params: { search }
    })
    return response.data
  },
  listDistricts: async (provinceCode: number, search = ''): Promise<DistrictItem[]> => {
    const response = await provincesClient.get<ProvinceWithDistricts>(`/p/${provinceCode}`, {
      params: { depth: 2 }
    })
    const districts = response.data?.districts || []
    return filterBySearch(districts, search)
  },
  listWards: async (districtCode: number, search = ''): Promise<WardItem[]> => {
    const response = await provincesClient.get<DistrictWithWards>(`/d/${districtCode}`, {
      params: { depth: 2 }
    })
    const wards = response.data?.wards || []
    return filterBySearch(wards, search)
  }
}

export default provinceApi
