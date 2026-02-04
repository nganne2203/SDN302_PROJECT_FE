import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProduct } from '@/hooks/useProduct'
import ProductDetail from '@/components/product/ProductDetail'
import { ButtonCommon } from '@/components/common'

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    selectedProduct,
    relatedProducts,
    isLoading,
    fetchProductById,
    fetchRelatedProducts
  } = useProduct()

  useEffect(() => {
    if (id) {
      fetchProductById(id)
      fetchRelatedProducts(id, 4)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleAddToCart = (productId: string, quantity: number) => {
    // TODO: Implement add to cart functionality
    // eslint-disable-next-line no-console
    console.log('Add to cart:', productId, quantity)
  }

  if (!selectedProduct && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy sản phẩm
          </h2>
          <ButtonCommon onClick={() => navigate('/products')}>
            Quay lại danh sách sản phẩm
          </ButtonCommon>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <a href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </a>
          <span>/</span>
          <a href="/products" className="hover:text-blue-600 transition-colors">
            Sản phẩm
          </a>
          {selectedProduct && (
            <>
              <span>/</span>
              <span className="text-gray-900 font-medium">
                {selectedProduct.name}
              </span>
            </>
          )}
        </nav>

        {/* Product Detail */}
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            relatedProducts={relatedProducts}
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
          />
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage
