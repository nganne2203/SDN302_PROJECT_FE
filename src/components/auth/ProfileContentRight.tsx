import { Card } from 'antd'
import { ButtonCommon, FieldCustom } from '../common'
import {
  type Control,
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFormSetValue,
  useWatch
} from 'react-hook-form'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import type { ProfileFormData } from '@/utils/validator'
import { LocationSelectGroup } from '../common'

interface ProfileContentRightProps {
  control: Control<ProfileFormData>;
  fields: FieldArrayWithId<ProfileFormData, 'addresses'>[];
  append: UseFieldArrayAppend<ProfileFormData, 'addresses'>;
  remove: UseFieldArrayRemove;
  setValue: UseFormSetValue<ProfileFormData>;
  disabled?: boolean;
}

const ProfileContentRight = ({
  control,
  fields,
  append,
  remove,
  setValue,
  disabled = false
}: ProfileContentRightProps) => {
  const watchedAddresses = useWatch({ control, name: 'addresses' }) || []

  return (
    <div className='lg:col-span-2'>
      <Card
        className='shadow-sm rounded-xl border-gray-200 h-full'
        bordered={false}
        title={
          <span className='text-lg font-bold flex items-center gap-2'>
            <MapPin className='w-5 h-5 text-primary' /> Địa chỉ
          </span>
        }
        // extra={
        //   <ButtonCommon
        //     type='button'
        //     variant='outline'
        //     size='sm'
        //     icon={<Plus className='w-4 h-4' />}
        //     disabled={disabled}
        //     onClick={() =>
        //       append({
        //         fullname: '',
        //         phone: '',
        //         addressLine: '',
        //         city: '',
        //         district: '',
        //         ward: '',
        //         isDefault: false
        //       })
        //     }
        //   >
        //     Thêm địa chỉ
        //   </ButtonCommon>
        // }
      >
        <div className='space-y-6'>
          {fields.map((field, index) => {
            const address = watchedAddresses[index] || field
            return (
              <div
                key={index}
                className='relative p-6 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-300'
              >
                <div className='absolute right-4 top-4 flex items-center gap-2'>
                  {index > 0 && (
                    <button
                      type='button'
                      onClick={() => remove(index)}
                      disabled={disabled}
                      className='p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  )}
                </div>

                <div className='mb-4 flex items-center gap-3'>
                  <span className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm'>
                    {index + 1}
                  </span>
                  <h3 className='font-semibold text-gray-800'>
                  Địa chỉ {index + 1}
                  </h3>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FieldCustom.Controlled
                    name={`addresses.${index}.fullname`}
                    control={control}
                    render={({ value, onChange, error }) => (
                      <FieldCustom.Input
                        placeholder='Người nhận'
                        value={value as string}
                        onChange={onChange}
                        error={error}
                        disabled={disabled}
                        className='mb-0'
                      />
                    )}
                  />

                  <FieldCustom.Controlled
                    name={`addresses.${index}.phone`}
                    control={control}
                    render={({ value, onChange, error }) => (
                      <FieldCustom.Input
                        placeholder='Số điện thoại'
                        value={value as string}
                        onChange={onChange}
                        error={error}
                        disabled={disabled}
                        className='mb-0'
                      />
                    )}
                  />

                  <div className='md:col-span-2'>
                    <FieldCustom.Controlled
                      name={`addresses.${index}.addressLine`}
                      control={control}
                      render={({ value, onChange, error }) => (
                        <FieldCustom.Input
                          placeholder='Số nhà, tên đường'
                          value={value as string}
                          onChange={onChange}
                          error={error}
                          disabled={disabled}
                          className='mb-0'
                        />
                      )}
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <LocationSelectGroup
                      provinceCode={address?.provinceCode}
                      districtCode={address?.districtCode}
                      wardCode={address?.wardCode}
                      disabled={disabled}
                      onChange={(changes) => {
                        if ('province' in changes) {
                          setValue(`addresses.${index}.city`, changes.province || '')
                        }
                        if ('district' in changes) {
                          setValue(`addresses.${index}.district`, changes.district || '')
                        }
                        if ('ward' in changes) {
                          setValue(`addresses.${index}.ward`, changes.ward || '')
                        }
                        if ('provinceCode' in changes) {
                          setValue(`addresses.${index}.provinceCode`, changes.provinceCode)
                        }
                        if ('districtCode' in changes) {
                          setValue(`addresses.${index}.districtCode`, changes.districtCode)
                        }
                        if ('wardCode' in changes) {
                          setValue(`addresses.${index}.wardCode`, changes.wardCode)
                        }
                      }}
                    />
                    <FieldCustom.Controlled
                      name={`addresses.${index}.provinceCode`}
                      control={control}
                      render={({ value, onChange }) => (
                        <input type='hidden' value={(value as number | undefined) ?? ''} onChange={onChange} />
                      )}
                    />
                    <FieldCustom.Controlled
                      name={`addresses.${index}.districtCode`}
                      control={control}
                      render={({ value, onChange }) => (
                        <input type='hidden' value={(value as number | undefined) ?? ''} onChange={onChange} />
                      )}
                    />
                    <FieldCustom.Controlled
                      name={`addresses.${index}.wardCode`}
                      control={control}
                      render={({ value, onChange }) => (
                        <input type='hidden' value={(value as number | undefined) ?? ''} onChange={onChange} />
                      )}
                    />
                  </div>
                </div>

                <div className='mt-4 flex items-center justify-between'>
                  <FieldCustom.Controlled
                    name={`addresses.${index}.isDefault`}
                    control={control}
                    render={({ value, onChange }) => (
                      <div className='flex items-center gap-2'>
                        <FieldCustom.Checkbox
                          checked={
                            fields.length === 1 ? true : (value as boolean)
                          }
                          disabled={fields.length === 1 || disabled}
                          onChange={(checked) => {
                            if (checked) {
                              fields.forEach((_, idx) => {
                                if (idx !== index) {
                                  setValue(`addresses.${idx}.isDefault`, false)
                                }
                              })
                            }
                            onChange(checked)
                          }}
                          label='Đặt làm địa chỉ mặc định'
                          className='mb-0'
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            )})}

          {fields.length > 0 && (
            <ButtonCommon
              type='button'
              variant='primary'
              className='w-full border-dashed'
              icon={<Plus className='w-4 h-4' />}
              disabled={disabled}
              onClick={() =>
                append({
                  fullname: '',
                  phone: '',
                  addressLine: '',
                  city: '',
                  district: '',
                  ward: '',
                  isDefault: false
                })
              }
            >
              Thêm địa chỉ mới
            </ButtonCommon>
          )}

          {fields.length === 0 && (
            <div className='text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300'>
              <MapPin className='w-12 h-12 text-gray-300 mx-auto mb-3' />
              <p className='text-gray-500'>Chưa có địa chỉ nào</p>
              <ButtonCommon
                variant='ghost'
                className='mt-2'
                disabled={disabled}
                onClick={() =>
                  append({
                    fullname: '',
                    phone: '',
                    addressLine: '',
                    city: '',
                    district: '',
                    ward: '',
                    isDefault: true
                  })
                }
              >
                Thêm ngay
              </ButtonCommon>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ProfileContentRight
