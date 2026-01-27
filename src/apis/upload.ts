import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, UploadedImage } from '@/types/api'

export const uploadApi = {
  uploadImage: async (file: File): Promise<ApiResponse<UploadedImage>> => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await apiClient.post<ApiResponse<UploadedImage>>(
      API_ENDPOINTS.UPLOAD.IMAGE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    return response.data
  },

  getImage: async (publicId: string): Promise<ApiResponse<UploadedImage>> => {
    const response = await apiClient.get<ApiResponse<UploadedImage>>(
      API_ENDPOINTS.UPLOAD.IMAGE_DETAIL(publicId)
    )

    return response.data
  }
}

export default uploadApi
