import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/constant'
import type { ApiError, ApiResponse, UserInfo, ProfileResponse } from '@/types/api'
import { mapBackendUserToUserInfo } from '@/utils/userMapper'
import { stripLocationCodesFromList } from '@/utils/address'
import uploadApi from './upload'
import type { AxiosError } from 'axios'

export interface UpdateProfileRequest {
  fullname?: string
  phone?: string
  avatar?: string
  addresses?: Array<{
    fullname: string
    phone: string
    addressLine: string
    city: string
    ward: string
    isDefault: boolean
  }>
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

const missingAvatarPublicIds = new Set<string>()

const resolveUserAvatar = async (user: UserInfo): Promise<UserInfo> => {
  const publicId = user.avatarId || user.avatar

  if (!publicId || publicId.startsWith('http')) {
    return {
      ...user,
      avatar: user.avatar,
      avatarId: user.avatarId || publicId
    }
  }

  const normalizedPublicId = publicId.startsWith('uploads/')
    ? publicId.replace(/^uploads\//, '')
    : publicId

  const candidatePublicIds = Array.from(new Set([publicId, normalizedPublicId]))

  const hasKnownMissingCandidate = candidatePublicIds.some((candidateId) => missingAvatarPublicIds.has(candidateId))
  if (hasKnownMissingCandidate) {
    return {
      ...user,
      avatarId: normalizedPublicId,
      avatar: undefined
    }
  }

  for (const candidateId of candidatePublicIds) {
    try {
      const imageResponse = await uploadApi.getImage(candidateId)
      return {
        ...user,
        avatarId: candidateId,
        avatar: imageResponse.data.imageUrl
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const statusCode = axiosError.response?.status
      const errorCode = axiosError.response?.data?.code
      const isNotFound = statusCode === 404 || errorCode === 'NOT_FOUND'

      if (isNotFound) {
        missingAvatarPublicIds.add(candidateId)
      }
    }
  }

  return {
    ...user,
    avatarId: normalizedPublicId,
    avatar: undefined
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
    const sanitizedData: UpdateProfileRequest = data.addresses
      ? {
        ...data,
        addresses: stripLocationCodesFromList(data.addresses)
      }
      : data

    const response = await apiClient.put<ApiResponse<UserInfo>>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      sanitizedData
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
