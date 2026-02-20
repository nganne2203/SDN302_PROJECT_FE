import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

export const extractApiError = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<ApiError>
  const data = axiosError.response?.data
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors[0]
  }
  return data?.message || fallback
}
