import axios from 'axios'

const provincesClient = axios.create({
  baseURL: 'https://provinces.open-api.vn/api/v2',
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

export const provinceApi = {
  listProvinces: async (search = ''): Promise<ProvinceItem[]> => {
    const response = await provincesClient.get<ProvinceItem[]>('/p/', {
      params: { search }
    })
    return response.data
  },
  listDistricts: async (provinceCode: number, search = ''): Promise<DistrictItem[]> => {
    const response = await provincesClient.get<DistrictItem[]>('/d/', {
      params: { province: provinceCode, search }
    })
    return response.data
  },
  listWards: async (districtCode: number, search = ''): Promise<WardItem[]> => {
    const response = await provincesClient.get<WardItem[]>('/w/', {
      params: { district: districtCode, search }
    })
    return response.data
  }
}

export default provinceApi
