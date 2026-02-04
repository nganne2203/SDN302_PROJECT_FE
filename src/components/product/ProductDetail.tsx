import { useState } from 'react'
import { ButtonCommon, LoaderCommon } from '@/components/common'
import type { Product } from '@/types/api'
import { formatCurrency } from '@/utils/formatCurrency'

interface ProductDetailProps {
  product: Product
  relatedProducts?: Product[]
  isLoading: boolean
  // eslint-disable-next-line no-unused-vars
  onAddToCart?: (productId: string, quantity: number) => void
}

const ProductDetail = ({
  product,
  relatedProducts,
  isLoading,
  onAddToCart
}: ProductDetailProps) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoaderCommon size="lg" />
      </div>
    )
  }

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product._id, quantity)
    }
  }

  return (
    <div className="space-y-8">
      {/* Product Detail Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {product.category.name}
            </div>

            {/* Name */}
            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
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
                <span className="text-lg font-semibold text-gray-900 ml-2">
                  {product.ratingAvg.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-600">
                ({product.ratingCount} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="py-4 border-y border-gray-200">
              <span className="text-4xl font-bold text-blue-600">
                {formatCurrency(product.price)}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mô tả sản phẩm
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Material */}
            {product.material && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-medium">Chất liệu:</span>
                <span>{product.material}</span>
              </div>
            )}

            {/* Compatibility */}
            {product.compatibility && product.compatibility.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Thiết bị tương thích:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.compatibility.map((deviceId, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {deviceId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="px-6 py-2 border-x border-gray-300 font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <ButtonCommon
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </ButtonCommon>
              <ButtonCommon
                variant="outline"
                size="lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </ButtonCommon>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {product.isActive ? 'Còn hàng' : 'Hết hàng'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <a
                key={relatedProduct._id}
                href={`/products/${relatedProduct._id}`}
                className="group"
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {relatedProduct.images && relatedProduct.images.length > 0 ? (
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                  {relatedProduct.name}
                </h3>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(relatedProduct.price)}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
