import { useCallback, useEffect, useMemo, useState } from 'react'
import { Image, Pagination, Rate, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { MessageSquare } from 'lucide-react'
import { FilterCommon, LoaderCommon } from '@/components/common'
import type { FilterField } from '@/components/common/FilterCommon'
import productApi from '@/apis/product'
import useReview from '@/hooks/useReview'
import type { Review, ReviewFilter, ReviewProduct } from '@/features/review/reviewTypes'
import type { Product } from '@/types/api'

const PAGE_SIZE = 10

const formatDateTime = (value?: string): string => {
  if (!value) return '--'
  return new Date(value).toLocaleString('vi-VN')
}

const resolveProduct = (review: Review): ReviewProduct | null => {
  if (review.product) return review.product
  return typeof review.productId === 'object' ? review.productId : null
}

const getProductImage = (product: ReviewProduct | null): string | undefined => {
  if (!product?.images?.length) return undefined

  const firstImage = product.images[0]
  if (typeof firstImage === 'string') return firstImage
  return firstImage?.imageUrl
}

const MyReviewHistory = () => {
  const {
    myReviews,
    myReviewsPagination,
    isLoading,
    fetchMyReviews
  } = useReview()

  const [filter, setFilter] = useState<ReviewFilter>({
    page: 1,
    limit: PAGE_SIZE,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [productOptions, setProductOptions] = useState<Array<{ value: string; label: string }>>([])

  const loadReviews = useCallback(() => {
    fetchMyReviews(filter)
  }, [fetchMyReviews, filter])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  useEffect(() => {
    let isMounted = true

    const fetchProducts = async () => {
      try {
        const response = await productApi.getAllProducts({ isActive: true })
        if (!isMounted) return

        const options = (response.data || []).map((product: Product) => ({
          value: product._id,
          label: product.name
        }))
        setProductOptions(options)
      } catch {
        if (!isMounted) return
        setProductOptions([])
      }
    }

    fetchProducts()

    return () => {
      isMounted = false
    }
  }, [])

  const handlePageChange = (page: number, pageSize: number) => {
    setFilter((prev) => ({
      ...prev,
      page,
      limit: pageSize || prev.limit || PAGE_SIZE
    }))
  }

  const handleFilterChange = (key: string, value: unknown) => {
    if (key === 'productId') {
      setFilter((prev) => ({
        ...prev,
        productId: (value as string | undefined) || undefined,
        page: 1
      }))
      return
    }

    if (key === 'rating') {
      setFilter((prev) => ({
        ...prev,
        rating: value ? Number(value) : undefined,
        page: 1
      }))
      return
    }

    if (key === 'sortOrder') {
      setFilter((prev) => ({
        ...prev,
        sortOrder: (value as 'asc' | 'desc') || 'desc',
        page: 1
      }))
    }
  }

  const handleReset = () => {
    setFilter({
      page: 1,
      limit: PAGE_SIZE,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const filterFields = useMemo<FilterField[]>(() => [
    {
      key: 'productId',
      label: 'Sản phẩm',
      type: 'select',
      placeholder: 'Lọc theo sản phẩm',
      options: productOptions,
      allowClear: true
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
      ],
      allowClear: true
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

  const columns: ColumnsType<Review> = useMemo(() => [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 320,
      render: (_, review) => {
        const product = resolveProduct(review)
        const imageUrl = getProductImage(product)
        return (
          <div className='flex items-start gap-3 min-w-0'>
            <div className='w-14 h-14 rounded-md overflow-hidden border border-gray-200 bg-gray-50 shrink-0'>
              {imageUrl ? (
                <img src={imageUrl} alt={product?.name || 'product'} className='w-full h-full object-cover' />
              ) : null}
            </div>
            <div className='min-w-0'>
              <div className='text-sm font-medium text-gray-900 max-w-[220px] overflow-hidden whitespace-nowrap text-ellipsis' title={product?.name || '--'}>
                {product?.name || '--'}
              </div>
              <div className='text-xs text-gray-500 max-w-[220px] overflow-hidden whitespace-nowrap text-ellipsis' title={product?._id || '--'}>
                {product?._id || '--'}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 170,
      render: (value: number) => (
        <div className='flex items-center gap-2 whitespace-nowrap'>
          <Rate disabled value={Number(value) || 0} style={{ fontSize: 14 }} />
          <span className='text-xs text-gray-600'>{Number(value) || 0}/5</span>
        </div>
      )
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      width: 360,
      render: (value: string | undefined) => {
        const comment = String(value || '').trim()
        return (
          <div className='max-w-[360px] overflow-hidden whitespace-nowrap text-ellipsis text-gray-700' title={comment || '--'}>
            {comment || '--'}
          </div>
        )
      }
    },
    {
      title: 'Ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 180,
      render: (value: Review['images']) => {
        if (!value?.length) return <span className='text-xs text-gray-400'>Không có</span>

        return (
          <div className='flex items-center gap-2'>
            {value.slice(0, 3).map((image, index) => (
              <Image
                key={`${image.publicId}-${index}`}
                src={image.imageUrl}
                alt={`review-${index + 1}`}
                width={40}
                height={40}
                className='rounded-md object-cover border border-gray-200'
                preview={{ mask: 'Xem' }}
              />
            ))}
            {value.length > 3 && (
              <span className='text-xs text-gray-500'>+{value.length - 3}</span>
            )}
          </div>
        )
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value: string) => <span className='text-xs text-gray-600'>{formatDateTime(value)}</span>
    }
  ], [])

  if (isLoading && myReviews.length === 0) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <LoaderCommon />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>Lịch sử đánh giá</h1>
          <p className='text-gray-600 mt-1'>Xem lại tất cả đánh giá bạn đã gửi cho sản phẩm</p>
        </div>

        <FilterCommon
          compact
          compactFillRow
          compactSingleRow
          showSearch={false}
          filters={filterFields}
          filterValues={{
            productId: filter.productId,
            rating: filter.rating,
            sortOrder: filter.sortOrder || 'desc'
          }}
          onFilterChange={handleFilterChange}
          showSort
          sortBy={filter.sortBy || 'createdAt'}
          sortOrder={filter.sortOrder || 'desc'}
          sortOptions={[
            { value: 'createdAt', label: 'Sắp xếp theo ngày tạo' },
            { value: 'rating', label: 'Sắp xếp theo rating' }
          ]}
          onSortChange={(field) => setFilter((prev) => ({
            ...prev,
            sortBy: (field as 'createdAt' | 'rating') || 'createdAt',
            page: 1
          }))}
          onReset={handleReset}
          showPagination={false}
        />

        <div className='bg-white rounded-lg shadow p-4'>
          {myReviews.length === 0 ? (
            <div className='p-8 text-center'>
              <MessageSquare className='w-16 h-16 text-gray-300 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>Chưa có đánh giá</h3>
              <p className='text-gray-500'>Bạn chưa gửi đánh giá nào cho sản phẩm.</p>
            </div>
          ) : (
            <Table<Review>
              dataSource={myReviews}
              rowKey={(record) => record._id}
              columns={columns}
              loading={isLoading}
              pagination={false}
              scroll={{ x: 1200 }}
            />
          )}
        </div>

        {myReviewsPagination && myReviewsPagination.totalPages > 1 && (
          <div className='mt-6 flex justify-center'>
            <Pagination
              current={myReviewsPagination.currentPage || filter.page || 1}
              total={myReviewsPagination.totalItems || 0}
              pageSize={myReviewsPagination.pageSize || filter.limit || PAGE_SIZE}
              showSizeChanger
              pageSizeOptions={[10, 20, 50]}
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MyReviewHistory
