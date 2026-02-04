import { useEffect, useRef, useState } from 'react'
import { useProduct } from '@/hooks/useProduct'
import LoaderCommon from '@/components/common/LoaderCommon'
import { useNavigate } from 'react-router-dom'
import { ShoppingOutlined, TruckOutlined, SafetyOutlined, CustomerServiceOutlined } from '@ant-design/icons'
import ProductCard from '@/components/product/ProductCard'
import SectionHeader from '@/components/common/SectionHeader'
import BranchCard from '@/components/branch/BranchCard'
import useBranch from '@/hooks/useBranch'

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
    fetchBranches()
  }, [fetchFeaturedProducts, fetchNewArrivals, fetchBranches])

  const displayProducts = featuredProducts.slice(0, 4)
  const displayNewArrivals = newArrivals.slice(0, 4)
  const displayBranches = branches.slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Chào mừng đến TechStore
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Hệ thống của hàng công nghệ uy tín với 3 chi nhánh trên toàn quốc
          </p>

          <button
            onClick={() => navigate('/products')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            Khám phá sản phẩm →
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 ">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <ShoppingOutlined className="text-3xl text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Sản phẩm chính hãng</h3>
              <p className="text-sm text-gray-600">100% hàng chính hãng, đầy đủ VAT</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <TruckOutlined className="text-3xl text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Giao hàng nhanh</h3>
              <p className="text-sm text-gray-600">Giao hàng toàn quốc trong 24h</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <SafetyOutlined className="text-3xl text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Bảo hành uy tín</h3>
              <p className="text-sm text-gray-600">Bảo hành chính hãng tại tất cả chi nhánh</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-orange-100 p-4 rounded-full mb-4">
                <CustomerServiceOutlined className="text-3xl text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Hỗ trợ 24/7</h3>
              <p className="text-sm text-gray-600">Đội ngũ tư vấn luôn sẵn sàng hỗ trợ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeader title="Sản phẩm nổi bật" />

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoaderCommon />
            </div>
          ) : displayProducts && displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Không có sản phẩm nổi bật
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      {displayNewArrivals && displayNewArrivals.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <SectionHeader title="Sản phẩm mới nhất" />

            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoaderCommon />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayNewArrivals.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {(isBranchLoading || displayBranches.length > 0) && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <SectionHeader title="Hệ thống chi nhánh" />

            {isBranchLoading ? (
              <div className="flex justify-center py-12">
                <LoaderCommon />
              </div>
            ) : displayBranches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayBranches.map((branch) => (
                  <BranchCard key={branch._id} branch={branch} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Không có chi nhánh
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
    </div>
  )
}

export default Home
