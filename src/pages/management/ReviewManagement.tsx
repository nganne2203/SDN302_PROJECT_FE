import { useEffect, useMemo, useRef, useState } from 'react'

import { FilterCommon, ModalCommon, TableCommon } from '@/components/common'
import productApi from '@/apis/product'
import { useReview } from '@/hooks/useReview'
import type { FilterField } from '@/components/common/FilterCommon'
import type { TableColumn } from '@/components/common/TableCommon'
import type { Review, ReviewFilter, ReviewProduct, ReviewUser } from '@/features/review/reviewTypes'
import type { Product } from '@/types/api'
import { Rate } from 'antd'

const DEFAULT_FILTER: ReviewFilter = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc'
}

type ReviewRow = Review & Record<string, unknown> & { key: string }

const formatDateTime = (value?: string): string => {
  if (!value) return '--'
  return new Date(value).toLocaleString('vi-VN')
}

const resolveProduct = (review: Review): ReviewProduct | null => {
  if (review.product) return review.product
  return typeof review.productId === 'object' ? review.productId : null
}

const resolveReviewer = (review: Review): ReviewUser | null => {
  if (review.user) return review.user
  return typeof review.userId === 'object' ? review.userId : null
}

const getProductImage = (product: ReviewProduct | null): string | undefined => {
  if (!product?.images?.length) return undefined

  const first = product.images[0]
  if (typeof first === 'string') return first
  return first?.imageUrl
}

const ReviewManagement = () => {
  const {
    allReviews,
    allReviewsPagination,
    isLoading,
    fetchAllReviews
  } = useReview()

  const [filter, setFilter] = useState<ReviewFilter>(DEFAULT_FILTER)
  const [productIdInput, setProductIdInput] = useState('')
  const [ratingInput, setRatingInput] = useState<number | undefined>(undefined)
  const [sortByInput, setSortByInput] = useState<'createdAt' | 'rating'>('createdAt')
  const [sortOrderInput, setSortOrderInput] = useState<'asc' | 'desc'>('desc')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [productOptions, setProductOptions] = useState<Array<{ value: string; label: string }>>([])

  const lastFetchParamsRef = useRef<string>('')

  useEffect(() => {
    let isMounted = true

    const fetchProductOptions = async () => {
      try {
        const response = await productApi.getAllProducts({ isActive: true })
        if (!isMounted) return

        const options = (response.data || []).map((product: Product) => ({
          value: product._id,
          label: `${product.name} (${product._id})`
        }))
        setProductOptions(options)
      } catch {
        if (!isMounted) return
        setProductOptions([])
      }
    }

    fetchProductOptions()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const requestFilter: ReviewFilter = {
      ...filter,
      productId: productIdInput.trim() || undefined,
      rating: ratingInput,
      sortBy: sortByInput,
      sortOrder: sortOrderInput
    }

    const paramsKey = JSON.stringify(requestFilter)
    if (lastFetchParamsRef.current === paramsKey) return

    lastFetchParamsRef.current = paramsKey
    fetchAllReviews(requestFilter)
  }, [filter, productIdInput, ratingInput, sortByInput, sortOrderInput, fetchAllReviews])

  const handleResetFilter = () => {
    setProductIdInput('')
    setRatingInput(undefined)
    setSortByInput('createdAt')
    setSortOrderInput('desc')
    setFilter(DEFAULT_FILTER)
  }

  const handleTableChange = (page: number, pageSize: number) => {
    setFilter((prev) => ({
      ...prev,
      page,
      limit: pageSize || prev.limit || 10
    }))
  }

  const reviewRows = useMemo<ReviewRow[]>(() => {
    return allReviews.map((review) => ({
      ...review,
      key: review._id
    }))
  }, [allReviews])

  const filterFields = useMemo<FilterField[]>(() => [
    {
      key: 'productId',
      label: 'Sản phẩm',
      type: 'select',
      placeholder: 'Lọc theo sản phẩm',
      options: productOptions
    },
    {
      key: 'rating',
      label: 'Rating',
      type: 'select',
      placeholder: 'Lọc theo rating',
      options: [
        { value: 5, label: '5 sao' },
        { value: 4, label: '4 sao' },
        { value: 3, label: '3 sao' },
        { value: 2, label: '2 sao' },
        { value: 1, label: '1 sao' }
      ]
    },
    {
      key: 'sortOrder',
      label: 'Thứ tự',
      type: 'select',
      placeholder: 'Chọn thứ tự',
      options: [
        { value: 'desc', label: 'Giảm dần' },
        { value: 'asc', label: 'Tăng dần' }
      ]
    }
  ], [productOptions])

  const currentPage = allReviewsPagination?.currentPage || filter.page || 1
  const pageSize = allReviewsPagination?.pageSize || filter.limit || 10
  const columns = useMemo<TableColumn<ReviewRow>[]>(() => [
    {
      key: 'stt',
      title: 'STT',
      width: 70,
      align: 'center',
      fixed: 'left',
      render: (_: unknown, __: ReviewRow, index: number) => {
        const serialNumber = (currentPage - 1) * pageSize + index + 1
        return <span className="font-medium text-gray-700">#{serialNumber}</span>
      }
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 320,
      render: (_value, review) => {
        const product = resolveProduct(review)
        const imageUrl = getProductImage(product)

        return (
          <div className='flex items-start gap-3'>
            <div className='w-14 h-14 rounded-md overflow-hidden border border-gray-200 bg-gray-50 shrink-0'>
              {imageUrl ? (
                <img src={imageUrl} alt={product?.name || 'product'} className='w-full h-full object-cover' />
              ) : null}
            </div>
            <div className='min-w-0'>
              <div className='text-sm font-medium text-gray-900 line-clamp-2'>
                {product?.name || 'Không xác định'}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      title: 'Người đánh giá',
      key: 'reviewer',
      width: 220,
      render: (_value, review) => {
        const reviewer = resolveReviewer(review)
        const reviewerInitial = (reviewer?.fullname || 'N').charAt(0).toUpperCase()
        return (
          <div className='flex items-center gap-2.5 min-w-0'>
            <div className='w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center shrink-0'>
              {reviewerInitial}
            </div>
            <div className='min-w-0'>
              <div className='text-sm font-medium text-gray-900 truncate'>
                {reviewer?.fullname || 'Người dùng'}
              </div>
              <div className='text-xs text-gray-500 truncate'>
                {reviewer?.email || '--'}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 170,
      render: (value) => (
        <div className='flex items-center gap-2 whitespace-nowrap'>
          <Rate
            disabled
            value={Number(value) || 0}
            style={{ fontSize: 14, lineHeight: 1, whiteSpace: 'nowrap' }}
          />
          <span className='text-xs text-gray-600'>{Number(value) || 0}/5</span>
        </div>
      )
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      width: 280,
      ellipsis: true,
      render: (value) => {
        const comment = String(value || '').trim()
        return (
          <div
            className='max-w-[320px] overflow-hidden whitespace-nowrap text-ellipsis text-sm text-gray-700'
            title={comment || '--'}
          >
            {comment || '--'}
          </div>
        )
      }
    },
    {
      title: 'Ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 170,
      render: (value) => {
        const images = value as Array<{ publicId: string; imageUrl: string }> | undefined
        if (!images?.length) return <span className='text-xs text-gray-400'>Không có</span>

        return (
          <div className='flex items-center gap-2'>
            {images.slice(0, 3).map((image, index) => (
              <button
                key={`${image.publicId}-${index}`}
                type='button'
                className='w-10 h-10 rounded-md overflow-hidden border border-gray-200'
                onClick={() => setPreviewImage(image.imageUrl)}
                title='Xem ảnh lớn'
              >
                <img src={image.imageUrl} alt={`review-img-${index + 1}`} className='w-full h-full object-cover' />
              </button>
            ))}
            {images.length > 3 && (
              <span className='text-xs text-gray-500'>+{images.length - 3}</span>
            )}
          </div>
        )
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (value) => <span className='text-xs text-gray-600'>{formatDateTime(String(value || ''))}</span>
    }
  ], [currentPage, pageSize])

  return (
    <div>
      <div className='mb-6 flex flex-col gap-2 md:flex-row md:items-start md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Quản lý đánh giá</h1>
          <p className='text-gray-500'>Chỉ xem danh sách đánh giá từ khách hàng</p>
        </div>
      </div>

      <FilterCommon
        compact
        compactFillRow
        compactSingleRow
        showSearch={false}
        filters={filterFields}
        filterValues={{
          productId: productIdInput || undefined,
          rating: ratingInput,
          sortOrder: sortOrderInput
        }}
        onFilterChange={(key, value) => {
          if (key === 'productId') {
            setProductIdInput((value as string | undefined) || '')
            return
          }

          if (key === 'rating') {
            setRatingInput((value as number | undefined) || undefined)
            return
          }

          if (key === 'sortOrder') {
            setSortOrderInput((value as 'asc' | 'desc') || 'desc')
          }
        }}
        showSort
        sortBy={sortByInput}
        sortOrder={sortOrderInput}
        sortOptions={[
          { value: 'createdAt', label: 'Sắp xếp theo ngày tạo' },
          { value: 'rating', label: 'Sắp xếp theo rating' }
        ]}
        onSortChange={(field) => setSortByInput((field as 'createdAt' | 'rating') || 'createdAt')}
        onReset={handleResetFilter}
        showPagination={false}
      />

      <TableCommon<ReviewRow>
        rowKey='_id'
        columns={columns}
        data={reviewRows}
        loading={isLoading}
        emptyText='Không có đánh giá'
        scroll={{ x: 'max-content' }}
        bordered
        size='small'
        pagination={{
          current: allReviewsPagination?.currentPage || filter.page || 1,
          pageSize: allReviewsPagination?.pageSize || filter.limit || 10,
          total: allReviewsPagination?.totalItems || 0,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} đánh giá`,
          onChange: handleTableChange
        }}
      />

      <ModalCommon
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        title='Ảnh đánh giá'
        size='md'
      >
        {previewImage && (
          <div className='flex items-center justify-center'>
            <img src={previewImage} alt='Review preview' className='max-h-[75vh] w-auto max-w-full object-contain rounded-lg' />
          </div>
        )}
      </ModalCommon>
    </div>
  )
}

export default ReviewManagement
