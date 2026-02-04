import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import axiosRetry from 'axios-retry'
import { env } from '@/configs/env'
import { STORAGE_KEYS, HTTP_STATUS, API_ENDPOINTS, ROUTES } from '@/constants/constant'
import { getStorage, setStorage, removeStorage } from '@/utils/storage'

// Create axios instance
export const apiClient = axios.create({
  baseURL: env.BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Configure axios retry
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStorage(STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = getStorage(STORAGE_KEYS.REFRESH_TOKEN)
        if (refreshToken) {
          const response = await axios.post(`${env.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
            refreshToken
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          setStorage(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
          setStorage(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      } catch {
        // Refresh failed, clear tokens and redirect to login
        removeStorage(STORAGE_KEYS.ACCESS_TOKEN)
        removeStorage(STORAGE_KEYS.REFRESH_TOKEN)
        removeStorage(STORAGE_KEYS.USER_INFO)
        window.location.href = ROUTES.HOME
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
