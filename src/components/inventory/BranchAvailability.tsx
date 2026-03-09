import { useEffect, useState, useCallback } from 'react'
import { Card, List, Tag, Spin, Empty, Alert, Button } from 'antd'
import { ReloadOutlined, ShopOutlined } from '@ant-design/icons'
import { branchApi } from '@/apis/branch'
import { storeInventoryApi } from '@/apis/storeInventory'
import type { Branch, StoreInventoryRecord } from '@/types/api'

interface BranchStock {
  branch: Branch
  inventory: StoreInventoryRecord | null
  error: boolean
}

interface BranchAvailabilityProps {
  productId: string
  title?: string
  className?: string
}

const BranchAvailability = ({
  productId,
  title = 'Tình trạng tồn kho tại các chi nhánh',
  className = ''
}: BranchAvailabilityProps) => {
  const [branchStocks, setBranchStocks] = useState<BranchStock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailability = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    setError(null)
    try {
      const branchRes = await branchApi.getAllBranches({ isActive: true })
      const branches = branchRes.data || []

      const results = await Promise.allSettled(
        branches.map(async (branch) => {
          try {
            const res = await storeInventoryApi.getByProduct(branch._id, productId)
            return { branch, inventory: res.data || null, error: false } as BranchStock
          } catch {
            return { branch, inventory: null, error: false } as BranchStock
          }
        })
      )

      const stocks = results.map((r) =>
        r.status === 'fulfilled'
          ? r.value
          : { branch: { _id: '', name: 'Không xác định' } as Branch, inventory: null, error: true }
      ).filter((s) => s.branch._id)

      setBranchStocks(stocks)
    } catch {
      setError('Không thể tải thông tin tồn kho chi nhánh')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  const getStockTag = (stock: BranchStock) => {
    if (stock.error || !stock.inventory) {
      return <Tag>Không có dữ liệu</Tag>
    }
    const qty = stock.inventory.quantity
    if (qty <= 0) {
      return <Tag color="error">Hết hàng</Tag>
    }
    if (qty <= stock.inventory.minThreshold) {
      return <Tag color="warning">Sắp hết ({qty})</Tag>
    }
    return <Tag color="success">Còn hàng ({qty})</Tag>
  }

  if (error) {
    return (
      <Alert
        type="error"
        message={error}
        showIcon
        action={
          <Button size="small" icon={<ReloadOutlined />} onClick={fetchAvailability}>
            Thử lại
          </Button>
        }
      />
    )
  }

  return (
    <Card
      title={
        <span>
          <ShopOutlined className="mr-2" />
          {title}
        </span>
      }
      size="small"
      className={className}
    >
      {loading ? (
        <div className="flex justify-center py-6">
          <Spin />
        </div>
      ) : branchStocks.length === 0 ? (
        <Empty description="Chưa có chi nhánh nào" />
      ) : (
        <List
          size="small"
          dataSource={branchStocks}
          renderItem={(stock) => (
            <List.Item
              key={stock.branch._id}
              extra={getStockTag(stock)}
            >
              <List.Item.Meta
                title={stock.branch.name}
                description={stock.branch.address}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}

export default BranchAvailability
