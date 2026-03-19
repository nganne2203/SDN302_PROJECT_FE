import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CustomerServiceOutlined,
  SafetyOutlined,
  ShoppingOutlined,
  TruckOutlined
} from '@ant-design/icons'
import LoaderCommon from '@/components/common/LoaderCommon'
import ProductCard from '@/components/product/ProductCard'
import SectionHeader from '@/components/common/SectionHeader'
import BranchCard from '@/components/branch/BranchCard'
import useBranch from '@/hooks/useBranch'
import { useProduct } from '@/hooks/useProduct'
import { ROUTES } from '@/constants/constant'
import type { Branch } from '@/types/api'
import sectionImage from '@/assets/image.png'

const Home = () => {
  const navigate = useNavigate()
  const {
    featuredProducts,
    newArrivals,
    fetchFeaturedProducts,
    fetchNewArrivals,
    isLoading
  } = useProduct()
  const { branches, fetchBranches, isLoading: isBranchLoading } = useBranch()
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (hasFetchedRef.current) return

    hasFetchedRef.current = true
    fetchFeaturedProducts()
    fetchNewArrivals()
    fetchBranches({ isActive: true })
  }, [fetchBranches, fetchFeaturedProducts, fetchNewArrivals])

  const displayProducts = featuredProducts.slice(0, 4)
  const displayNewArrivals = newArrivals.slice(0, 4)
  const displayBranches = branches.slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="py-14 text-white md:py-16"
        style={{
          backgroundImage: `url(${sectionImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Chào mừng đến TechStore
          </h1>
          <p className="mb-8 text-xl text-white">
            Hệ thống cửa hàng công nghệ uy tín với đa chi nhánh trên toàn quốc
          </p>

          <button
            onClick={() => navigate(ROUTES.PRODUCTS)}
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            Khám phá sản phẩm →
          </button>
        </div>
      </section>

      <section className="bg-white py-2 md:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4 md:gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 rounded-full bg-blue-100 p-3">
                <ShoppingOutlined className="text-3xl text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-800">Sản phẩm chính hãng</h3>
              <p className="text-sm text-gray-600">100% hàng chính hãng, đầy đủ VAT</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-3 rounded-full bg-green-100 p-3">
                <TruckOutlined className="text-3xl text-green-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-800">Giao hàng nhanh</h3>
              <p className="text-sm text-gray-600">Giao hàng toàn quốc trong thời gian ngắn</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-3 rounded-full bg-purple-100 p-3">
                <SafetyOutlined className="text-3xl text-purple-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-800">Bảo hành uy tín</h3>
              <p className="text-sm text-gray-600">Bảo hành chính hãng tại tất cả chi nhánh</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-3 rounded-full bg-orange-100 p-3">
                <CustomerServiceOutlined className="text-3xl text-orange-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-800">Hỗ trợ 24/7</h3>
              <p className="text-sm text-gray-600">Đội ngũ tư vấn luôn sẵn sàng hỗ trợ</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-4 md:py-6">
        <div className="container mx-auto px-4">
          <SectionHeader title="Sản phẩm nổi bật" viewAllPath={ROUTES.PRODUCTS} />

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoaderCommon />
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
              {displayProducts.map((product) => (
                <div key={product._id} className="mx-auto w-full max-w-[270px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              Không có sản phẩm nổi bật
            </div>
          )}
        </div>
      </section>

      {displayNewArrivals.length > 0 && (
        <section className="bg-gray-50 py-4 md:py-6">
          <div className="container mx-auto px-4">
            <SectionHeader title="Sản phẩm mới nhất" viewAllPath={ROUTES.PRODUCTS} />

            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoaderCommon />
              </div>
            ) : (
              <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
                {displayNewArrivals.map((product) => (
                  <div key={product._id} className="mx-auto w-full max-w-[270px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {(isBranchLoading || displayBranches.length > 0) && (
        <section className="bg-gray-50 py-4 md:py-6">
          <div className="container mx-auto px-4">
            <SectionHeader title="Hệ thống chi nhánh" viewAllPath={ROUTES.BRANCHES} />

            {isBranchLoading ? (
              <div className="flex justify-center py-12">
                <LoaderCommon />
              </div>
            ) : displayBranches.length > 0 ? (
              <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
                {displayBranches.map((branch: Branch) => (
                  <div key={branch._id} className="mx-auto h-full w-full max-w-[270px]">
                    <BranchCard branch={branch} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                Không có chi nhánh
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
