import axios from 'axios'
import { env } from '@/configs/env'

const provincesClient = axios.create({
  baseURL: env.LOCATION_API_BASE,
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
  district_code?: number
  province_code?: number
  district_name?: string
}

interface ProvinceDetailResponse extends ProvinceItem {
  districts?: DistrictItem[]
}

interface ProvinceWithWardsResponse extends ProvinceItem {
  wards?: WardItem[]
}

interface DistrictDetailResponse extends DistrictItem {
  wards?: WardItem[]
}

const normalizeSearch = (value: string): string => value.trim().toLowerCase()

const filterByName = <T extends { name: string }>(items: T[], search = ''): T[] => {
  const keyword = normalizeSearch(search)
  if (!keyword) return items
  return items.filter((item) => normalizeSearch(item.name).includes(keyword))
}

export const provinceApi = {
  listProvinces: async (search = ''): Promise<ProvinceItem[]> => {
    const response = await provincesClient.get<ProvinceItem[]>('/p/')
    return filterByName(response.data, search)
  },
  listDistricts: async (provinceCode: number, search = ''): Promise<DistrictItem[]> => {
    const response = await provincesClient.get<ProvinceDetailResponse>(`/p/${provinceCode}`, {
      params: { depth: 2 }
    })
    return filterByName(response.data.districts || [], search)
  },
  listWards: async (districtCode: number, search = ''): Promise<WardItem[]> => {
    const response = await provincesClient.get<DistrictDetailResponse>(`/d/${districtCode}`, {
      params: { depth: 2 }
    })
    return filterByName(response.data.wards || [], search)
  },
  listWardsByProvince: async (provinceCode: number, search = ''): Promise<WardItem[]> => {
    const response = await provincesClient.get<ProvinceWithWardsResponse>(`/p/${provinceCode}`, {
      params: { depth: 2 }
    })

    return filterByName(response.data.wards || [], search)
  }
}

export default provinceApi
