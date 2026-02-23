import type { UserInfo, ShippingAddress, UserRole } from '@/types/api'

export interface UpdateProfilePayload {
  fullname?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface Address {
  fullname: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  ward: string;
  provinceCode?: number;
  districtCode?: number;
  wardCode?: number;
  isDefault: boolean;
}

export interface User {
  _id: string;
  fullname: string;
  email: string;
  role: UserRole;
  phone?: string;
  branch: string | null;
  avatarId?: string;
  avatar?: string;
  addresses: Address[];
  isActive: boolean;
  provider?: string;
  googleId?: string | null;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface UserState {
  profile: UserInfo | null;
  addresses: ShippingAddress[];
  isLoading: boolean;
  error: string | null;
}

export interface UserFilter {
  role?: UserRole | ''
  isActive?: boolean | ''
  sortBy?: string
  sortOrder?: 'asc' | 'desc' | ''
}