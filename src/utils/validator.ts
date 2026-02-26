import { z } from 'zod'

export const emailSchema = z
  .string()
  .min(1, 'Email là bắt buộc')
  .email('Email không hợp lệ')

export const passwordSchema = z
  .string()
  .min(1, 'Mật khẩu là bắt buộc')
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(20, 'Mật khẩu không được quá 20 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất một chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất một chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất một chữ số')
  .regex(
    /[!@#$%^&*(),.?':{}|<>]/,
    'Mật khẩu phải có ít nhất một ký tự đặc biệt'
  )

export const phoneSchema = z
  .string()
  .min(1, 'Số điện thoại là bắt buộc')
  .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ')

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
  password: passwordSchema
})

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
    fullName: fullNameSchema,
    phoneNumber: phoneSchema
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export const otpVerificationSchema = z.object({
  code: otpCodeSchema
})

export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export const setPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Xác nhận mật khẩu mới là bắt buộc')
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmNewPassword']
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword']
  })

export const shippingAddressSchema = z.object({
  fullName: fullNameSchema,
  phoneNumber: z
    .string()
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
  province: z.string().min(1, 'Tỉnh/Thành phố là bắt buộc'),
  district: z.string().min(1, 'Quận/Huyện là bắt buộc'),
  ward: z.string().min(1, 'Phường/Xã là bắt buộc'),
  provinceCode: z.string().optional(),
  districtCode: z.string().optional(),
  wardCode: z.string().optional(),
  address: z.string().min(1, 'Địa chỉ chi tiết là bắt buộc')
})

export const userAddressSchema = z.object({
  fullname: z.string().min(1, 'Vui lòng nhập họ và tên người nhận').trim(),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  addressLine: z.string().min(1, 'Vui lòng nhập địa chỉ chi tiết').trim(),
  city: z.string().min(1, 'Vui lòng nhập thành phố').trim(),
  district: z.string().min(1, 'Vui lòng nhập quận/huyện').trim(),
  ward: z.string().min(1, 'Vui lòng nhập phường/xã').trim(),
  provinceCode: z.string().optional(),
  districtCode: z.string().optional(),
  wardCode: z.string().optional(),
  isDefault: z.boolean().optional()
})

export const userProfileSchema = z.object({
  fullname: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  addresses: z.array(userAddressSchema),
  avatar: z.string().optional()
})

export const updateServiceSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên dịch vụ').optional(),
  description: z.string().optional(),
  type: z.string().min(1, 'Vui lòng chọn loại dịch vụ').optional(),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0').optional()
})

export const createServiceSchema = z.object({
  product: z.string().min(1, 'Vui lòng chọn sản phẩm'),
  name: z.string().min(1, 'Vui lòng nhập tên dịch vụ'),
  description: z.string().optional(),
  type: z.string().min(1, 'Vui lòng chọn loại dịch vụ'),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0')
})

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OTPVerificationFormData = z.infer<typeof otpVerificationSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type SetPasswordFormData = z.infer<typeof setPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
export type ProfileFormData = z.infer<typeof userProfileSchema>;
export type CreateServiceFormData = z.infer<typeof createServiceSchema>
export type UpdateServiceFormData = z.infer<typeof updateServiceSchema>

export const createReviewSchema = z.object({
  rating: z.number({ error: 'Vui lòng chọn số sao đánh giá' }).min(1, 'Vui lòng chọn ít nhất 1 sao').max(5),
  comment: z.string().max(1000, 'Nhận xét không được vượt quá 1000 ký tự').optional(),
  imageUrls: z.string().optional()
})

export const updateReviewSchema = z.object({
  rating: z.number().min(1, 'Vui lòng chọn ít nhất 1 sao').max(5).optional(),
  comment: z.string().max(1000, 'Nhận xét không được vượt quá 1000 ký tự').optional(),
  imageUrls: z.string().optional()
})

export type CreateReviewFormData = z.infer<typeof createReviewSchema>
export type UpdateReviewFormData = z.infer<typeof updateReviewSchema>