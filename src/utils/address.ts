export type LocationCodeFields = 'provinceCode' | 'districtCode' | 'wardCode' | 'district'

export const stripLocationCodes = <T extends Record<string, unknown>>(
  data: T
): Omit<T, LocationCodeFields> => {
  const rest = { ...data } as Omit<T, LocationCodeFields> & Partial<Record<LocationCodeFields, unknown>>
  delete rest.provinceCode
  delete rest.districtCode
  delete rest.wardCode
  delete rest.district
  return rest
}

export const stripLocationCodesFromList = <T extends Record<string, unknown>>(
  list: T[]
): Array<Omit<T, LocationCodeFields>> => {
  return list.map(stripLocationCodes)
}
