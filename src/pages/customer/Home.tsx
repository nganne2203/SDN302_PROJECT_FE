import { useEffect, useRef } from 'react'
import FooterLayout from '@/components/layout/FooterLayout'
import HeaderLayout from '@/components/layout/HeaderLayout'
import { useProduct } from '@/hooks/useProduct'
import LoaderCommon from '@/components/common/LoaderCommon'
import { useNavigate } from 'react-router-dom'
import { ShoppingOutlined, TruckOutlined, SafetyOutlined, CustomerServiceOutlined } from '@ant-design/icons'

const Home = () => {
  const navigate = useNavigate()
  const {
    featuredProducts,
    newArrivals,
    fetchFeaturedProducts,
    fetchNewArrivals,
    isLoading
  } = useProduct()

  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetchFeaturedProducts()
    fetchNewArrivals()
  }, [fetchFeaturedProducts, fetchNewArrivals])

  const displayProducts = featuredProducts.slice(0, 4)
  const displayNewArrivals = newArrivals.slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLayout />

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
      <section className="bg-white py-12 border-b">
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">
              Sản phẩm nổi bật
            </h2>
            <button
              onClick={() => navigate('/products')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Xem tất cả →
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoaderCommon />
            </div>
          ) : displayProducts && displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-200"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">Hình ảnh sản phẩm</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-2">{product.category?.name}</p>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-14">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-blue-600 font-bold text-lg">
                          {product.price?.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      {product.ratingAvg && (
                        <div className="text-sm text-yellow-500">
                          ⭐ {product.ratingAvg.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/products/${product._id}`)
                      }}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
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
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800">
                Sản phẩm mới nhất
              </h2>
              <button
                onClick={() => navigate('/products')}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Xem tất cả →
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoaderCommon />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayNewArrivals.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-200"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">Hình ảnh sản phẩm</span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-2">{product.category?.name}</p>
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-14">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-blue-600 font-bold text-lg">
                            {product.price?.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                        {product.ratingAvg && (
                          <div className="text-sm text-yellow-500">
                            ⭐ {product.ratingAvg.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/products/${product._id}`)
                        }}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <FooterLayout />
    </div>
  )
}

export default Home
