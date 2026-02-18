import { useEffect } from 'react'
import { useProduct } from '@/hooks/useProduct'
import ProductHeader from '@/components/product/ProductHeader'
import ProductFilter from '@/components/product/ProductFilter'
import ProductList from '@/components/product/ProductList'
import ProductModal from '@/components/product/ProductModal'

const ProductManagement = () => {
  const {
    products,
    pagination,
    categories,
    filter,
    isLoading,
    isSubmitting,
    isUploadingImages,
    formData,
    formErrors,
    isModalOpen,
    isEditMode,
    fetchProducts,
    fetchCategories,
    updateFilter,
    resetFilter,
    openCreateModal,
    openEditModal,
    closeModal,
    handleFormChange,
    handleSubmit,
    handleDelete,
    handleToggleStatus
  } = useProduct()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (Object.keys(filter).length > 0) {
      fetchProducts(filter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handlePageChange = (page: number) => {
    updateFilter({ ...filter, page })
  }

  return (
    <div className="p-2">
      {/* Header */}
      <ProductHeader onCreateClick={openCreateModal} />

      {/* Filters */}
      <ProductFilter
        filter={filter}
        categories={categories}
        onFilterChange={updateFilter}
        onClearFilter={resetFilter}
      />

      <ProductList
        products={products}
        pagination={pagination}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onPageChange={handlePageChange}
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        isUploadingImages={isUploadingImages}
        categories={categories}
        onClose={closeModal}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default ProductManagement
