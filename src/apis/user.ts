import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiResponse, UserInfo, ProfileResponse } from '@/types/api'
import { mapBackendUserToUserInfo } from '@/utils/userMapper'
import uploadApi from './upload'

export interface UpdateProfileRequest {
  fullname?: string
  phone?: string
  avatar?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface ConfirmResetPasswordRequest {
  token: string
  newPassword: string
}

export interface SetPasswordRequest {
  password: string
}

const resolveUserAvatar = async (user: UserInfo): Promise<UserInfo> => {
  const publicId = user.avatarId || user.avatar

  if (!publicId || publicId.startsWith('http')) {
    return {
      ...user,
      avatar: user.avatar,
      avatarId: user.avatarId || publicId
    }
  }

  try {
    const imageResponse = await uploadApi.getImage(publicId)
    return {
      ...user,
      avatarId: publicId,
      avatar: imageResponse.data.imageUrl
    }
  } catch {
    return {
      ...user,
      avatarId: publicId
    }
  }
}

export const userApi = {
  getProfile: async (): Promise<ApiResponse<UserInfo>> => {
    const response = await apiClient.get<ApiResponse<ProfileResponse>>(API_ENDPOINTS.USER.PROFILE)
    const userInfo = mapBackendUserToUserInfo(response.data.data.user)
    const userWithAvatar = await resolveUserAvatar(userInfo)

    return {
      ...response.data,
      data: userWithAvatar
    }
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserInfo>> => {
    const response = await apiClient.put<ApiResponse<UserInfo>>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      data
    )
    const userWithAvatar = await resolveUserAvatar(response.data.data)

    return {
      ...response.data,
      data: userWithAvatar
    }
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.USER.CHANGE_PASSWORD,
      data
    )
    return response.data
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.USER.RESET_PASSWORD,
      data
    )
    return response.data
  },

  confirmResetPassword: async (data: ConfirmResetPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.USER.CONFIRM_RESET_PASSWORD,
      data
    )
    return response.data
  },

  setPassword: async (data: SetPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.USER.SET_PASSWORD,
      data
    )
    return response.data
  }
}

export default userApi
