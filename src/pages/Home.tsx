import FooterLayout from '@/components/layout/FooterLayout'
import HeaderLayout from '@/components/layout/HeaderLayout'

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLayout />
      {/* Hero Section */}
      <section className="bg-linear-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Phụ Kiện Điện Thoại Chính Hãng
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Chất lượng cao - Giá tốt nhất - Bảo hành uy tín
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Khám phá ngay
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Danh Mục Sản Phẩm
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Ốp lưng', 'Sạc dự phòng', 'Tai nghe', 'Cáp sạc'].map((category) => (
              <div
                key={category}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-semibold text-gray-800">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Sản Phẩm Nổi Bật
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Hình ảnh sản phẩm</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Tên sản phẩm</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-bold">199.000 ₫</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <FooterLayout />
    </div>
  )
}

export default Home
