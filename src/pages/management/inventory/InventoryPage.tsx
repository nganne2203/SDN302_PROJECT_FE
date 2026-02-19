import { useMemo, useState } from 'react'
import { Tabs, message } from 'antd'
import useInventory from '@/hooks/useInventory'
import type { InventoryRecord, StoreInventoryRecord } from '@/types/api'
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
    filteredBranchInventory,
    filteredMainInventory,
    branchStats,
    branchLoading,
    mainLoading,
    branchPagination,
    setBranchPagination,
    mainPagination,
    setMainPagination,
    updateThresholds,
    createStoreInventory,
    deleteStoreInventory,
    updateMainInventory,
    createMainInventory,
    adjustMainInventory
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
    () => (isAdmin ? 'Quan ly ton kho' : 'Quan ly ton kho chi nhanh'),
    [isAdmin]
  )
  const headerDescription = useMemo(
    () => (isAdmin
      ? 'Theo doi kho tong va ton kho chi nhanh'
      : 'Theo doi ton kho, nguong canh bao tai chi nhanh cua ban'
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
      message.success('Tao ton kho moi thanh cong')
      setCreateModalOpen(false)
    } catch {
      message.error('Khong the tao ton kho moi')
    } finally {
      setCreateSaving(false)
    }
  }

  const handleAdjustSubmit = async (values: AdjustInventoryFormValues) => {
    if (!adjustInventory) return
    try {
      setAdjustSaving(true)
      await adjustMainInventory(adjustInventory.product._id, values.quantity)
      message.success('Dieu chinh ton kho thanh cong')
      setAdjustModalOpen(false)
      setAdjustInventory(null)
    } catch {
      message.error('Khong the dieu chinh ton kho')
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
      message.success('Tao ton kho chi nhanh thanh cong')
      setStoreCreateModalOpen(false)
    } catch {
      message.error('Khong the tao ton kho chi nhanh')
    } finally {
      setStoreCreateSaving(false)
    }
  }

  const handleStoreDelete = async (record: StoreInventoryRecord) => {
    if (!selectedBranchId) return
    try {
      await deleteStoreInventory(record._id, selectedBranchId)
      message.success('Xoa ton kho chi nhanh thanh cong')
    } catch {
      message.error('Khong the xoa ton kho chi nhanh')
    }
  }

  const handleThresholdSubmit = async (values: { minThreshold?: number; maxThreshold?: number }) => {
    if (!selectedStoreInventory || !selectedBranchId) return
    try {
      setThresholdSaving(true)
      await updateThresholds(selectedBranchId, selectedStoreInventory.product._id, values)
      message.success('Cap nhat nguong ton kho thanh cong')
      setThresholdModalOpen(false)
      setSelectedStoreInventory(null)
    } catch {
      message.error('Khong the cap nhat nguong ton kho')
    } finally {
      setThresholdSaving(false)
    }
  }

  const handleMainSubmit = async (values: { quantity?: number; location?: string }) => {
    if (!selectedMainInventory) return
    try {
      setMainSaving(true)
      await updateMainInventory(selectedMainInventory._id, values)
      message.success('Cap nhat ton kho kho tong thanh cong')
      setMainModalOpen(false)
      setSelectedMainInventory(null)
    } catch {
      message.error('Khong the cap nhat ton kho kho tong')
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
              label: 'Kho tong',
              children: (
                <MainInventoryPanel
                  data={filteredMainInventory}
                  loading={mainLoading}
                  pagination={mainPagination}
                  onPaginationChange={setMainPagination}
                  searchText={searchText}
                  onSearchTextChange={setSearchText}
                  onEdit={handleMainEdit}
                  onCreate={handleCreate}
                  onAdjust={handleAdjustOpen}
                />
              )
            },
            {
              key: 'branch',
              label: 'Kho chi nhanh',
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
