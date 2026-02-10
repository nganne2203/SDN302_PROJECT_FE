import { useMemo, useState } from 'react'
import { Tabs, message } from 'antd'
import useInventory from '@/hooks/useInventory'
import type { InventoryRecord, StoreInventoryRecord } from '@/types/api'
import BranchInventoryPanel from './components/BranchInventoryPanel'
import MainInventoryPanel from './components/MainInventoryPanel'
import ThresholdModal from './components/ThresholdModal'
import MainInventoryModal from './components/MainInventoryModal'

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
    updateMainInventory
  } = useInventory()

  const [selectedStoreInventory, setSelectedStoreInventory] = useState<StoreInventoryRecord | null>(null)
  const [selectedMainInventory, setSelectedMainInventory] = useState<InventoryRecord | null>(null)
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false)
  const [mainModalOpen, setMainModalOpen] = useState(false)
  const [thresholdSaving, setThresholdSaving] = useState(false)
  const [mainSaving, setMainSaving] = useState(false)

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
                />
              )
            }
          ]}
        />
      ) : (
        <BranchInventoryPanel
          isAdmin={false}
          canEditThresholds={isManager}
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
    </div>
  )
}

export default InventoryPage
