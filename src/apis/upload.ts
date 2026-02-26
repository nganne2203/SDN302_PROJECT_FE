import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, UploadedImage, UploadMultipleImagesResponse } from '@/types/api'

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

  uploadMultipleImages: async (files: File[]): Promise<ApiResponse<UploadMultipleImagesResponse>> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('images', file)
    })

    const response = await apiClient.post<ApiResponse<UploadMultipleImagesResponse>>(
      API_ENDPOINTS.UPLOAD.MULTIPLE_IMAGES,
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
    const endpoint = API_ENDPOINTS.UPLOAD.IMAGE_DETAIL(encodeURIComponent(publicId))
    const response = await apiClient.get<ApiResponse<UploadedImage>>(endpoint)
    return response.data
  }
}

export default uploadApi
