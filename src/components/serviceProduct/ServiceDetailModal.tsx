import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import ModalCommon from '@/components/common/ModalCommon'
import ButtonCommon from '@/components/common/ButtonCommon'
import FieldCustom from '@/components/common/FieldCustom' // Default export is object with properties
import { useProduct } from '@/hooks/useProduct'
import type { ServiceProduct } from '@/features/serviceProduct/serviceProductTypes'
import { SERVICE_PRODUCT_TYPE } from '@/constants/constant'
import { createServiceSchema, updateServiceSchema, type CreateServiceFormData, type UpdateServiceFormData } from '@/utils/validator'

/* eslint-disable no-unused-vars */
interface ServiceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  data?: ServiceProduct | null
  onSubmit: (data: CreateServiceFormData | UpdateServiceFormData) => void
  loading?: boolean
}

const ServiceDetailModal = ({
  isOpen,
  onClose,
  data,
  onSubmit,
  loading = false
}: ServiceDetailModalProps) => {
  const { fetchProducts, products } = useProduct()
  const schema = data ? updateServiceSchema : createServiceSchema

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const productOptions = products.map((prod) => ({
    value: prod._id,
    label: prod.name
  }))

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<CreateServiceFormData | UpdateServiceFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      type: 'engraving',
      price: 0,
      ...(!data && { product: '' })
    }
  })

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        description: data.description,
        type: data.type,
        price: data.price
      })
    } else {
      reset({
        product: '',
        name: '',
        description: '',
        type: 'engraving',
        price: 0
      })
    }
  }, [data, isOpen, reset])

  const handleFormSubmit = (formData: CreateServiceFormData | UpdateServiceFormData) => {
    onSubmit(formData)
  }

  return (
    <ModalCommon
      isOpen={isOpen}
      onClose={onClose}
      title={data ? 'Cập nhật dịch vụ' : 'Thêm mới dịch vụ'}
      size='md'
      footer={
        <div className='flex justify-end gap-2'>
          <ButtonCommon
            variant='secondary'
            onClick={onClose}
            disabled={loading || isSubmitting}
          >
            Hủy
          </ButtonCommon>
          <ButtonCommon
            onClick={handleSubmit(handleFormSubmit)}
            isLoading={loading || isSubmitting}
            disabled={loading || isSubmitting}
          >
            {data ? 'Cập nhật' : 'Thêm mới'}
          </ButtonCommon>
        </div>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
        {!data && (
          <FieldCustom.Controlled
            name='product'
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <FieldCustom.Select
                label='Sản phẩm'
                placeholder='Chọn sản phẩm'
                required
                options={productOptions}
                value={value ? (value as string) : undefined}
                onChange={onChange}
                onBlur={onBlur}
                error={error}
                showSearch
                optionFilterProp='label'
              />
            )}
          />
        )}

        <FieldCustom.Controlled
          name='name'
          control={control}
          render={({ value, onChange, onBlur, error }) => (
            <FieldCustom.Input
              label='Tên dịch vụ'
              placeholder='Nhập tên dịch vụ'
              required
              value={value as string}
              onChange={onChange}
              onBlur={onBlur}
              error={error}
            />
          )}
        />

        <FieldCustom.Controlled
          name='description'
          control={control}
          render={({ value, onChange, onBlur, error }) => (
            <FieldCustom.TextArea
              label='Mô tả'
              placeholder='Nhập mô tả dịch vụ'
              rows={4}
              required
              value={value as string}
              onChange={onChange}
              onBlur={onBlur}
              error={error}
            />
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
          <FieldCustom.Controlled
            name='type'
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <FieldCustom.Select
                label='Loại dịch vụ'
                options={SERVICE_PRODUCT_TYPE}
                required
                value={value as string}
                onChange={onChange}
                onBlur={onBlur}
                error={error}
              />
            )}
          />

          <FieldCustom.Controlled
            name='price'
            control={control}
            render={({ value, onChange, onBlur, error }) => (
              <FieldCustom.Number
                label='Giá dịch vụ'
                placeholder='0'
                required
                value={value as number}
                onChange={onChange}
                onBlur={onBlur}
                error={error}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                style={{ width: '100%' }}
              />
            )}
          />
        </div>
      </form>
    </ModalCommon>
  )
}

export default ServiceDetailModal
