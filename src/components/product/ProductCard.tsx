import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '@/types/api'
import { formatCurrency } from '@/utils/formatCurrency'
import { ButtonCommon } from '@/components/common'
import LoginRequiredModal from '@/components/common/LoginRequiredModal'
import cartApi from '@/apis/cart'
import { toast } from '@/utils/toast'
import { useAppSelector } from '@/apps/hooks'

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isAdding, setIsAdding] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    if (isAdding) return
    setIsAdding(true)
    try {
      await cartApi.addToCart(product._id, 1)
      toast.success('Đã thêm vào giỏ hàng')
    } catch {
      toast.error('Thêm vào giỏ hàng thất bại')
    } finally {
      setIsAdding(false)
    }
  }

  const categoryName = product.category?.name || 'Chưa phân loại'
  const firstImage = product.images?.[0]
  const imageUrl =
    typeof firstImage === 'string'
      ? firstImage
      : firstImage?.imageUrl

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      <Link to={`/products/${product._id}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badge */}
          {product.ratingAvg >= 4.5 && (
            <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
              Nổi bật
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-gray-500 mb-1">{categoryName}</p>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.ratingAvg)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.ratingAvg.toFixed(1)} ({product.ratingCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(product.price)}
            </span>
          </div>

          {/* Material */}
          {product.material && (
            <p className="text-xs text-gray-500 mt-2">
              Chất liệu: {product.material}
            </p>
          )}
        </div>
      </Link>

      <div className="px-4 pb-4">
        <div className="flex gap-2 w-full">
          <ButtonCommon
            variant="primary"
            size="sm"
            className="!bg-black !border-black !text-white hover:!bg-gray-900 hover:!border-gray-900 flex-1"
            isLoading={isAdding}
            onClick={handleAddToCart}
          >
            Thêm vào giỏ
          </ButtonCommon>
          <Link to={`/products/${product._id}`} className="flex-1">
            <ButtonCommon
              variant="outline"
              size="sm"
              className="!border-gray-300 !text-gray-900 hover:!border-gray-500 hover:!text-black !bg-white w-full"
            >
              Chi tiết
            </ButtonCommon>
          </Link>
        </div>
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}

export default ProductCard
