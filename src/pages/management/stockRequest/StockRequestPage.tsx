import { useState } from 'react'
import { Alert, Button } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import useStockRequest from '@/hooks/useStockRequest'
import { toast } from '@/utils/toast'
import { extractApiError } from '@/utils/apiError'
import StockRequestStats from './components/StockRequestStats'
import StockRequestFilters from './components/StockRequestFilters'
import StockRequestTable from './components/StockRequestTable'
import StockRequestCreateModal from './components/StockRequestCreateModal'
import StockRequestActionModal, { type StockRequestAction } from './components/StockRequestActionModal'
import StockRequestDetailModal from './components/StockRequestDetailModal'
import type { StockRequestRecord } from '@/types/api'

const StockRequestPage = () => {
  const {
    isAdmin,
    isManager,
    requests,
    pagination,
    setPagination,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    products,
    availableInventoryByProduct,
    pendingCount,
    approvedCount,
    partialCount,
    rejectCount,
    createRequest,
    updateRequestStatus,
    selectedRequest,
    setSelectedRequest,
    detailLoading,
    fetchDetail,
    retry
  } = useStockRequest()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<StockRequestAction>('approve')
  const [actionRecord, setActionRecord] = useState<StockRequestRecord | null>(null)
  const [actionSaving, setActionSaving] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailActionSaving, setDetailActionSaving] = useState(false)

  const handleCreate = async (values: { product: string; quantity: number; reason?: string }) => {
    try {
      setCreateSaving(true)
      await createRequest(values)
      toast.success('Tạo yêu cầu nhập kho thành công')
      setCreateModalOpen(false)
    } catch (err) {
      if (err instanceof Error && err.message === 'missing_branch') {
        toast.error('Bạn chưa được gắn chi nhánh')
        return
      }
      toast.error(extractApiError(err, 'Không thể tạo yêu cầu nhập kho'))
    } finally {
      setCreateSaving(false)
    }
  }

  const openAction = (type: StockRequestAction, record: StockRequestRecord) => {
    setActionType(type)
    setActionRecord(record)
    setActionModalOpen(true)
  }

  const handleAction = async (values: { note?: string; approvedQuantity?: number }) => {
    if (!actionRecord) return
    try {
      setActionSaving(true)
      await updateRequestStatus(actionRecord._id, actionType, {
        note: values.note,
        approvedQuantity: values.approvedQuantity
      })
      toast.success(actionType === 'approve' ? 'Đã duyệt yêu cầu' : 'Đã từ chối yêu cầu')
      setActionModalOpen(false)
    } catch (err) {
      toast.error(extractApiError(err, actionType === 'approve' ? 'Không thể duyệt yêu cầu' : 'Không thể từ chối yêu cầu'))
    } finally {
      setActionSaving(false)
    }
  }

  const handleViewDetail = async (record: StockRequestRecord) => {
    setDetailModalOpen(true)
    await fetchDetail(record._id)
  }

  const handleDetailApprove = async (payload: { approvedQuantity: number; note?: string }) => {
    if (!selectedRequest) return
    try {
      setDetailActionSaving(true)
      await updateRequestStatus(selectedRequest._id, 'approve', payload)
      toast.success('Đã duyệt yêu cầu')
      setDetailModalOpen(false)
      setSelectedRequest(null)
    } catch (err) {
      toast.error(extractApiError(err, 'Không thể duyệt yêu cầu'))
    } finally {
      setDetailActionSaving(false)
    }
  }

  const handleDetailReject = async (note: string) => {
    if (!selectedRequest) return
    try {
      setDetailActionSaving(true)
      await updateRequestStatus(selectedRequest._id, 'reject', { note })
      toast.success('Đã từ chối yêu cầu')
      setDetailModalOpen(false)
      setSelectedRequest(null)
    } catch (err) {
      toast.error(extractApiError(err, 'Không thể từ chối yêu cầu'))
    } finally {
      setDetailActionSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isAdmin ? 'Quản lý yêu cầu nhập kho toàn hệ thống' : 'Yêu cầu nhập kho chi nhánh'}
          </h1>
          <p className="text-gray-500">
            {isAdmin
              ? 'Duyệt và xuất kho từ inventory chung về các chi nhánh'
              : 'Tạo yêu cầu nhập kho từ kho tổng'}
          </p>
        </div>
        {isManager && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            className="w-full md:w-auto"
          >
            Tạo yêu cầu nhập kho mới
          </Button>
        )}
      </div>

      <StockRequestStats pendingCount={pendingCount} approvedCount={approvedCount} partialCount={partialCount} rejectCount={rejectCount} />

      {isAdmin && pendingCount > 0 && (
        <Alert
          message={`Còn ${pendingCount} yêu cầu chờ duyệt`}
          description="Vui lòng kiểm tra và phê duyệt các yêu cầu nhập kho"
          type="warning"
          showIcon
          closable
          className="mb-6"
        />
      )}

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          className="mb-6"
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={retry}>
              Thử lại
            </Button>
          }
        />
      )}

      <StockRequestFilters
        statusFilter={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value)
          setPagination((prev) => ({ ...prev, current: 1 }))
        }}
      />

      <StockRequestTable
        data={requests}
        loading={loading}
        pagination={pagination}
        availableInventoryByProduct={availableInventoryByProduct}
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
        onViewDetail={handleViewDetail}
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
        requestedQuantity={actionRecord?.quantity}
        availableQuantity={
          actionRecord?.product?._id ? availableInventoryByProduct[actionRecord.product._id] : 0
        }
        onSubmit={handleAction}
        isSubmitting={actionSaving}
      />

      <StockRequestDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedRequest(null)
        }}
        request={selectedRequest}
        loading={detailLoading}
        isAdmin={isAdmin}
        availableQuantity={
          selectedRequest?.product?._id ? availableInventoryByProduct[selectedRequest.product._id] : 0
        }
        onApprove={isAdmin ? handleDetailApprove : undefined}
        onReject={isAdmin ? handleDetailReject : undefined}
        isActioning={detailActionSaving}
      />
    </div>
  )
}

export default StockRequestPage
