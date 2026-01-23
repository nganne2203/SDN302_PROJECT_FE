import { z } from 'zod'

export const emailSchema = z
  .string()
  .min(1, 'Email là bắt buộc')
  .email('Email không hợp lệ')

export const passwordSchema = z
  .string()
  .min(1, 'Mật khẩu là bắt buộc')
  .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
  .max(50, 'Mật khẩu không được quá 50 ký tự')

export const phoneSchema = z
  .string()
  .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ')
  .optional()
  .or(z.literal(''))

export const fullNameSchema = z
  .string()
  .min(1, 'Họ tên là bắt buộc')
  .min(2, 'Họ tên phải có ít nhất 2 ký tự')
  .max(100, 'Họ tên không được quá 100 ký tự')

export const otpCodeSchema = z
  .string()
  .length(6, 'Mã OTP phải có 6 số')
  .regex(/^\d{6}$/, 'Mã OTP chỉ chứa số')

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
  fullName: fullNameSchema,
  phoneNumber: phoneSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

export const otpVerificationSchema = z.object({
  code: otpCodeSchema,
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

export const setPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Xác nhận mật khẩu mới là bắt buộc'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmNewPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
  path: ['newPassword'],
})

export const shippingAddressSchema = z.object({
  fullName: fullNameSchema,
  phoneNumber: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
  province: z.string().min(1, 'Tỉnh/Thành phố là bắt buộc'),
  district: z.string().min(1, 'Quận/Huyện là bắt buộc'),
  ward: z.string().min(1, 'Phường/Xã là bắt buộc'),
  address: z.string().min(1, 'Địa chỉ chi tiết là bắt buộc'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type OTPVerificationFormData = z.infer<typeof otpVerificationSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type SetPasswordFormData = z.infer<typeof setPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>
