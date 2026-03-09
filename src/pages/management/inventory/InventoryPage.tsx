import { useMemo, useState } from 'react'
import { Tabs } from 'antd'
import useInventory from '@/hooks/useInventory'
import type { InventoryRecord, StoreInventoryRecord } from '@/types/api'
import { toast } from '@/utils/toast'
import { extractApiError } from '@/utils/apiError'
import BranchInventoryPanel from './components/BranchInventoryPanel'
import MainInventoryPanel from './components/MainInventoryPanel'
import ThresholdModal from './components/ThresholdModal'
import MainInventoryModal from './components/MainInventoryModal'
import CreateInventoryModal from './components/CreateInventoryModal'
import AdjustInventoryModal from './components/AdjustInventoryModal'
import CreateStoreInventoryModal from './components/CreateStoreInventoryModal'
import type { CreateInventoryFormValues } from './components/CreateInventoryModal'
import type { AdjustInventoryFormValues } from './components/AdjustInventoryModal'
import type { CreateStoreInventoryFormValues } from './components/CreateStoreInventoryModal'

const InventoryPage = () => {
  const {
    isAdmin,
    isManager,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    branchView,
    setBranchView,
    searchText,
    setSearchText,
    mainLowStockOnly,
    setMainLowStockOnly,
    filteredBranchInventory,
    filteredMainInventory,
    branchStats,
    branchLoading,
    mainLoading,
    branchError,
    mainError,
    branchPagination,
    setBranchPagination,
    mainPagination,
    setMainPagination,
    updateThresholds,
    createStoreInventory,
    deleteStoreInventory,
    updateMainInventory,
    createMainInventory,
    adjustMainInventory,
    retryBranch,
    retryMain
  } = useInventory()

  const [selectedStoreInventory, setSelectedStoreInventory] = useState<StoreInventoryRecord | null>(null)
  const [selectedMainInventory, setSelectedMainInventory] = useState<InventoryRecord | null>(null)
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false)
  const [mainModalOpen, setMainModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [adjustInventory, setAdjustInventory] = useState<InventoryRecord | null>(null)
  const [thresholdSaving, setThresholdSaving] = useState(false)
  const [mainSaving, setMainSaving] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [adjustSaving, setAdjustSaving] = useState(false)
  const [storeCreateModalOpen, setStoreCreateModalOpen] = useState(false)
  const [storeCreateSaving, setStoreCreateSaving] = useState(false)

  const headerTitle = useMemo(
    () => (isAdmin ? 'Quản lý tồn kho' : 'Quản lý tồn kho chi nhánh'),
    [isAdmin]
  )
  const headerDescription = useMemo(
    () => (isAdmin
      ? 'Theo dõi kho tổng và tồn kho chi nhánh'
      : 'Theo dõi tồn kho, ngưỡng cảnh báo tại chi nhánh của bạn'
    ),
    [isAdmin]
  )

  const handleThresholdEdit = (record: StoreInventoryRecord) => {
    setSelectedStoreInventory(record)
    setThresholdModalOpen(true)
  }

  const handleMainEdit = (record: InventoryRecord) => {
    setSelectedMainInventory(record)
    setMainModalOpen(true)
  }

  const handleCreate = () => {
    setCreateModalOpen(true)
  }

  const handleAdjustOpen = (record: InventoryRecord) => {
    setAdjustInventory(record)
    setAdjustModalOpen(true)
  }

  const handleCreateSubmit = async (values: CreateInventoryFormValues) => {
    try {
      setCreateSaving(true)
      await createMainInventory({
        product: values.product,
        quantity: values.quantity,
        location: values.location
      })
      toast.success('Tạo tồn kho mới thành công')
      setCreateModalOpen(false)
    } catch (error) {
      toast.error(extractApiError(error, 'Không thể tạo tồn kho mới'))
    } finally {
      setCreateSaving(false)
    }
  }

  const handleAdjustSubmit = async (values: AdjustInventoryFormValues) => {
    if (!adjustInventory) return
    try {
      setAdjustSaving(true)
      await adjustMainInventory(adjustInventory.product._id, values.quantity)
      toast.success('Điều chỉnh tồn kho thành công')
      setAdjustModalOpen(false)
      setAdjustInventory(null)
    } catch (error) {
      toast.error(extractApiError(error, 'Không thể điều chỉnh tồn kho'))
    } finally {
      setAdjustSaving(false)
    }
  }

  const handleStoreCreate = () => {
    setStoreCreateModalOpen(true)
  }

  const handleStoreCreateSubmit = async (values: CreateStoreInventoryFormValues) => {
    try {
      setStoreCreateSaving(true)
      await createStoreInventory({
        branch: values.branch,
        product: values.product,
        quantity: values.quantity,
        minThreshold: values.minThreshold,
        maxThreshold: values.maxThreshold
      })
      toast.success('Tạo tồn kho chi nhánh thành công')
      setStoreCreateModalOpen(false)
    } catch (error) {
      toast.error(extractApiError(error, 'Không thể tạo tồn kho chi nhánh'))
    } finally {
      setStoreCreateSaving(false)
    }
  }

  const handleStoreDelete = async (record: StoreInventoryRecord) => {
    if (!selectedBranchId) return
    try {
      await deleteStoreInventory(record._id, selectedBranchId)
      toast.success('Xóa tồn kho chi nhánh thành công')
    } catch (error) {
      toast.error(extractApiError(error, 'Không thể xóa tồn kho chi nhánh'))
    }
  }

  const handleThresholdSubmit = async (values: { minThreshold?: number; maxThreshold?: number }) => {
    if (!selectedStoreInventory || !selectedBranchId) return
    try {
      setThresholdSaving(true)
      await updateThresholds(selectedBranchId, selectedStoreInventory.product._id, values)
      toast.success('Cập nhật ngưỡng tồn kho thành công')
      setThresholdModalOpen(false)
      setSelectedStoreInventory(null)
    } catch (error) {
      toast.error(extractApiError(error, 'Không thể cập nhật ngưỡng tồn kho'))
    } finally {
      setThresholdSaving(false)
    }
  }

  const handleMainSubmit = async (values: { quantity?: number; location?: string }) => {
    if (!selectedMainInventory) return
    try {
      setMainSaving(true)
      await updateMainInventory(selectedMainInventory._id, values)
      toast.success('Cập nhật tồn kho kho tổng thành công')
      setMainModalOpen(false)
      setSelectedMainInventory(null)
    } catch (error) {
      toast.error(extractApiError(error, 'Không thể cập nhật tồn kho kho tổng'))
    } finally {
      setMainSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{headerTitle}</h1>
        <p className="text-gray-500">{headerDescription}</p>
      </div>

      {isAdmin ? (
        <Tabs
          defaultActiveKey="main"
          items={[
            {
              key: 'main',
              label: 'Kho tổng',
              children: (
                <MainInventoryPanel
                  data={filteredMainInventory}
                  loading={mainLoading}
                  error={mainError}
                  onRetry={retryMain}
                  pagination={mainPagination}
                  onPaginationChange={setMainPagination}
                  searchText={searchText}
                  onSearchTextChange={setSearchText}
                  lowStockOnly={mainLowStockOnly}
                  onLowStockToggle={setMainLowStockOnly}
                  onEdit={handleMainEdit}
                  onCreate={handleCreate}
                  onAdjust={handleAdjustOpen}
                />
              )
            },
            {
              key: 'branch',
              label: 'Kho chi nhánh',
              children: (
                <BranchInventoryPanel
                  isAdmin={isAdmin}
                  canEditThresholds={isAdmin || isManager}
                  canCreate={isAdmin || isManager}
                  canDelete={isAdmin}
                  branches={branches}
                  selectedBranchId={selectedBranchId}
                  onBranchChange={(value) => {
                    setSelectedBranchId(value)
                    setBranchPagination((prev) => ({ ...prev, current: 1 }))
                  }}
                  branchView={branchView}
                  onBranchViewChange={(value) => {
                    setBranchView(value)
                    setBranchPagination((prev) => ({ ...prev, current: 1 }))
                  }}
                  branchInventory={filteredBranchInventory}
                  branchStats={branchStats}
                  searchText={searchText}
                  onSearchTextChange={setSearchText}
                  loading={branchLoading}
                  error={branchError}
                  onRetry={retryBranch}
                  pagination={branchPagination}
                  onPaginationChange={setBranchPagination}
                  onEditThresholds={handleThresholdEdit}
                  onCreate={handleStoreCreate}
                  onDelete={handleStoreDelete}
                />
              )
            }
          ]}
        />
      ) : (
        <BranchInventoryPanel
          isAdmin={false}
          canEditThresholds={isManager}
          canCreate={isManager}
          canDelete={false}
          branches={branches}
          selectedBranchId={selectedBranchId}
          onBranchChange={(value) => setSelectedBranchId(value)}
          branchView={branchView}
          onBranchViewChange={(value) => setBranchView(value)}
          branchInventory={filteredBranchInventory}
          branchStats={branchStats}
          searchText={searchText}
          onSearchTextChange={setSearchText}
          loading={branchLoading}
          error={branchError}
          onRetry={retryBranch}
          pagination={branchPagination}
          onPaginationChange={setBranchPagination}
          onEditThresholds={handleThresholdEdit}
          onCreate={handleStoreCreate}
          onDelete={handleStoreDelete}
        />
      )}

      {selectedStoreInventory && selectedBranchId && (
        <ThresholdModal
          isOpen={thresholdModalOpen}
          onClose={() => setThresholdModalOpen(false)}
          defaultValues={{
            minThreshold: selectedStoreInventory.minThreshold,
            maxThreshold: selectedStoreInventory.maxThreshold
          }}
          onSubmit={handleThresholdSubmit}
          isSubmitting={thresholdSaving}
        />
      )}

      {selectedMainInventory && (
        <MainInventoryModal
          isOpen={mainModalOpen}
          onClose={() => setMainModalOpen(false)}
          defaultValues={{
            quantity: selectedMainInventory.quantity,
            location: selectedMainInventory.location || ''
          }}
          onSubmit={handleMainSubmit}
          isSubmitting={mainSaving}
        />
      )}

      <CreateInventoryModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={createSaving}
      />

      {adjustInventory && (
        <AdjustInventoryModal
          isOpen={adjustModalOpen}
          onClose={() => {
            setAdjustModalOpen(false)
            setAdjustInventory(null)
          }}
          productName={adjustInventory.product?.name || ''}
          currentQuantity={adjustInventory.quantity}
          onSubmit={handleAdjustSubmit}
          isSubmitting={adjustSaving}
        />
      )}

      <CreateStoreInventoryModal
        isOpen={storeCreateModalOpen}
        onClose={() => setStoreCreateModalOpen(false)}
        onSubmit={handleStoreCreateSubmit}
        isSubmitting={storeCreateSaving}
        isAdmin={isAdmin}
        branches={branches}
        fixedBranchId={selectedBranchId}
      />
    </div>
  )
}

export default InventoryPage
