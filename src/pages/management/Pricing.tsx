import PricingHeader from '@/components/pricing/PricingHeader'
import PricingFilterComponent from '@/components/pricing/PricingFilter'
import PricingListComponent from '@/components/pricing/PricingList'
import PricingModalComponent from '@/components/pricing/PricingModal'
import PricingBulkModal from '@/components/pricing/PricingBulkModal'
import usePricingManagement from '@/hooks/usePricingManagement'

const ManagementPricing = () => {
  const {
    pricings,
    pagination,
    filter,
    isLoading,
    productOptions,
    isLoadingProducts,
    isModalOpen,
    isBulkModalOpen,
    isEditMode,
    formData,
    formErrors,
    isSubmitting,
    handleSetFilter,
    handleClearFilter,
    handleOpenModal,
    handleCloseModal,
    handleOpenBulkModal,
    handleCloseBulkModal,
    handleFormChange,
    handleSubmit,
    handleDelete,
    handleToggleStatus,
    handleBulkSubmit
  } = usePricingManagement()

  return (
    <div className="p-2">
      <PricingHeader
        onAddClick={() => handleOpenModal()}
        onBulkClick={handleOpenBulkModal}
      />

      <PricingFilterComponent
        filter={filter}
        onFilterChange={(key, value) => handleSetFilter({ [key]: value, page: 1 })}
        pagination={{
          page: (filter.page as number) || 1,
          limit: (filter.limit as number) || 10,
          total: pagination?.totalItems || 0
        }}
        onPageChange={(page, pageSize) => handleSetFilter({ page, limit: pageSize })}
        onReset={handleClearFilter}
        productOptions={productOptions}
      />

      {isLoadingProducts && (
        <div className="mb-4 text-sm text-gray-500">Đang tải sản phẩm...</div>
      )}

      <PricingListComponent
        pricings={pricings}
        isLoading={isLoading}
        pagination={{
          page: (filter.page as number) || 1,
          limit: (filter.limit as number) || 10,
          total: pagination?.totalItems || 0
        }}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onPageChange={(page, pageSize) => handleSetFilter({ page, limit: pageSize })}
      />

      <PricingModalComponent
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        productOptions={productOptions}
        onClose={handleCloseModal}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
      />

      <PricingBulkModal
        isOpen={isBulkModalOpen}
        isSubmitting={isSubmitting}
        productOptions={productOptions}
        onClose={handleCloseBulkModal}
        onSubmit={handleBulkSubmit}
      />
    </div>
  )
}

export default ManagementPricing
