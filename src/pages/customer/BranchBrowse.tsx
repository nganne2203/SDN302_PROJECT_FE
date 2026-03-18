import { useEffect, useMemo, useState } from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Empty } from 'antd'
import { Link } from 'react-router-dom'
import branchApi from '@/apis/branch'
import BranchCard from '@/components/branch/BranchCard'
import { CardCommon, FilterCommon, LoaderCommon, PaginationCommon } from '@/components/common'
import { ROUTES } from '@/constants/constant'
import useCachedQuery from '@/hooks/useCachedQuery'
import useDebounce from '@/hooks/useDebounce'
import type { Branch } from '@/types/api'
import { extractApiError } from '@/utils/apiError'
import { CACHE_DURATION } from '@/utils/cacheHelper'

const DEFAULT_SORT = 'updatedAt-desc'
const BRANCHES_PER_PAGE = 4

const sortOptions = [
  { value: 'updatedAt-desc', label: 'Mới cập nhật' },
  { value: 'name-asc', label: 'Tên A-Z' },
  { value: 'name-desc', label: 'Tên Z-A' }
]

const normalizeKeyword = (value: string) => value.trim().toLowerCase()

const BranchBrowse = () => {
  const [search, setSearch] = useState('')
  const [sortValue, setSortValue] = useState(DEFAULT_SORT)
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 250)
  const keyword = useMemo(() => normalizeKeyword(debouncedSearch), [debouncedSearch])
  const [sortBy, sortOrder] = sortValue.split('-') as [string, 'asc' | 'desc']

  const {
    data: allBranches = [],
    error,
    isLoading
  } = useCachedQuery<Branch[]>(
    ['branch-directory', 'active'],
    async () => {
      const response = await branchApi.getAllBranches({ isActive: true })
      return response.data || []
    },
    {
      staleTimeMs: CACHE_DURATION.EXTRA_LONG
    }
  )

  useEffect(() => {
    setPage(1)
  }, [keyword, sortValue])

  const filteredBranches = useMemo(() => {
    if (!keyword) return allBranches

    return allBranches.filter((branch) => {
      const branchName = normalizeKeyword(branch.name)
      const branchAddress = normalizeKeyword(branch.address)
      return branchName.includes(keyword) || branchAddress.includes(keyword)
    })
  }, [allBranches, keyword])

  const sortedBranches = useMemo(() => {
    const branches = [...filteredBranches]

    branches.sort((a, b) => {
      if (sortBy === 'name') {
        const left = a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
        return sortOrder === 'asc' ? left : -left
      }

      const left = new Date(a.updatedAt).getTime()
      const right = new Date(b.updatedAt).getTime()
      return sortOrder === 'asc' ? left - right : right - left
    })

    return branches
  }, [filteredBranches, sortBy, sortOrder])

  const totalBranches = allBranches.length
  const managedBranches = useMemo(
    () => allBranches.filter((branch) => Boolean(branch.manager)).length,
    [allBranches]
  )
  const filteredCount = sortedBranches.length
  const startIndex = (page - 1) * BRANCHES_PER_PAGE
  const visibleBranches = sortedBranches.slice(startIndex, startIndex + BRANCHES_PER_PAGE)

  const handleReset = () => {
    setSearch('')
    setSortValue(DEFAULT_SORT)
    setPage(1)
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const emptyDescription = totalBranches === 0
    ? 'Hiện chưa có chi nhánh đang hoạt động'
    : 'Không tìm thấy chi nhánh phù hợp'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5">
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeftOutlined />
            Quay lại trang chủ
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Hệ thống chi nhánh
          </h1>
          <p className="mt-3 max-w-3xl text-base text-gray-600">
            Tra cứu tất cả chi nhánh đang hoạt động, tìm địa chỉ phù hợp và mở nhanh bản đồ chỉ đường.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <CardCommon className="shadow-sm">
            <p className="text-sm text-gray-500">Chi nhánh đang hoạt động</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{totalBranches}</p>
          </CardCommon>

          <CardCommon className="shadow-sm">
            <p className="text-sm text-gray-500">Chi nhánh đã có quản lý</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{managedBranches}</p>
          </CardCommon>
        </div>

        <FilterCommon
          compact
          showSort={false}
          showPagination={false}
          searchPlaceholder="Tìm theo tên chi nhánh hoặc địa chỉ"
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              key: 'sort',
              label: 'Sắp xếp',
              type: 'select',
              placeholder: 'Sắp xếp',
              allowClear: false,
              options: sortOptions
            }
          ]}
          filterValues={{ sort: sortValue }}
          onFilterChange={(key, value) => {
            if (key === 'sort' && typeof value === 'string') {
              setSortValue(value)
            }
          }}
          onReset={handleReset}
          showReset={Boolean(search) || sortValue !== DEFAULT_SORT}
        />

        {error ? (
          <CardCommon className="shadow-sm">
            <div className="py-8 text-center text-red-500">
              {extractApiError(error, 'Không thể tải danh sách chi nhánh')}
            </div>
          </CardCommon>
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <LoaderCommon />
          </div>
        ) : filteredCount === 0 ? (
          <CardCommon className="shadow-sm">
            <Empty description={emptyDescription} className="py-8" />
          </CardCommon>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Hiển thị {visibleBranches.length} trên {totalBranches} chi nhánh đang hoạt động
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {visibleBranches.map((branch) => (
                <div key={branch._id} className="h-full w-full">
                  <BranchCard branch={branch} showManager />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <PaginationCommon
                current={page}
                pageSize={BRANCHES_PER_PAGE}
                total={filteredCount}
                onChange={(nextPage) => handlePageChange(nextPage)}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} / ${total} kết quả`}
                align="center"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BranchBrowse
