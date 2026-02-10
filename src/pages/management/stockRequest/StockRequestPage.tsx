import { useState } from 'react'
import { Alert, message } from 'antd'
import useStockRequest from '@/hooks/useStockRequest'
import StockRequestStats from './components/StockRequestStats'
import StockRequestFilters from './components/StockRequestFilters'
import StockRequestTable from './components/StockRequestTable'
import StockRequestCreateModal from './components/StockRequestCreateModal'
import StockRequestActionModal, { type StockRequestAction } from './components/StockRequestActionModal'
import type { StockRequestRecord } from '@/types/api'

const StockRequestPage = () => {
  const {
    isAdmin,
    isManager,
    requests,
    pagination,
    setPagination,
    loading,
    statusFilter,
    setStatusFilter,
    products,
    pendingCount,
    approvedCount,
    createRequest,
    updateRequestStatus
  } = useStockRequest()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<StockRequestAction>('approve')
  const [selectedRequest, setSelectedRequest] = useState<StockRequestRecord | null>(null)
  const [actionSaving, setActionSaving] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)

  const handleCreate = async (values: { product: string; quantity: number; reason?: string }) => {
    try {
      setCreateSaving(true)
      await createRequest(values)
      message.success('Tao yeu cau nhap kho thanh cong')
      setCreateModalOpen(false)
    } catch (error) {
      if (error instanceof Error && error.message === 'missing_branch') {
        message.error('Ban chua duoc gan chi nhanh')
        return
      }
      message.error('Khong the tao yeu cau nhap kho')
    } finally {
      setCreateSaving(false)
    }
  }

  const openAction = (type: StockRequestAction, record: StockRequestRecord) => {
    setActionType(type)
    setSelectedRequest(record)
    setActionModalOpen(true)
  }

  const handleAction = async (values: { note?: string }) => {
    if (!selectedRequest) return
    try {
      setActionSaving(true)
      await updateRequestStatus(selectedRequest._id, actionType, values.note)
      message.success(actionType === 'approve' ? 'Da duyet yeu cau' : 'Da tu choi yeu cau')
      setActionModalOpen(false)
    } catch {
      message.error(actionType === 'approve' ? 'Khong the duyet yeu cau' : 'Khong the tu choi yeu cau')
    } finally {
      setActionSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isAdmin ? 'Quan ly yeu cau nhap kho toan he thong' : 'Yeu cau nhap kho chi nhanh'}
        </h1>
        <p className="text-gray-500">
          {isAdmin
            ? 'Duyet va xuat kho tu inventory chung ve cac chi nhanh'
            : 'Tao yeu cau nhap kho tu kho tong'}
        </p>
      </div>

      <StockRequestStats pendingCount={pendingCount} approvedCount={approvedCount} />

      {isAdmin && pendingCount > 0 && (
        <Alert
          message={`Con ${pendingCount} yeu cau cho duyet`}
          description="Vui long kiem tra va phe duyet cac yeu cau nhap kho"
          type="warning"
          showIcon
          closable
          className="mb-6"
        />
      )}

      <StockRequestFilters
        isManager={isManager}
        statusFilter={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value)
          setPagination((prev) => ({ ...prev, current: 1 }))
        }}
        onCreate={() => setCreateModalOpen(true)}
      />

      <StockRequestTable
        data={requests}
        loading={loading}
        pagination={pagination}
        onPaginationChange={(tablePagination) =>
          setPagination({
            current: tablePagination.current || 1,
            pageSize: tablePagination.pageSize || 10,
            total: pagination.total
          })
        }
        isAdmin={isAdmin}
        onApprove={(record) => openAction('approve', record)}
        onReject={(record) => openAction('reject', record)}
      />

      <StockRequestCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreate}
        products={products}
        isSubmitting={createSaving}
      />

      <StockRequestActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        actionType={actionType}
        onSubmit={handleAction}
        isSubmitting={actionSaving}
      />
    </div>
  )
}

export default StockRequestPage
