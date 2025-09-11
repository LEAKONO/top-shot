import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import DataTable from '../../components/admin/DataTable'
import { ordersAPI } from '../../api/orders'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/date'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10
  })

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getOrders(filters)
      setOrders(response.data.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus)
      fetchOrders() // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const orderColumns = [
    { field: '_id', header: 'Order ID', render: (order) => order._id.slice(-8) },
    { 
      field: 'user', 
      header: 'Customer', 
      render: (order) => order.user?.name || order.customer?.name || 'N/A' 
    },
    { field: 'total', header: 'Amount', render: (order) => formatCurrency(order.total) },
    { field: 'paymentStatus', header: 'Payment Status' },
    { field: 'status', header: 'Order Status' },
    { field: 'createdAt', header: 'Date', render: (order) => formatDate(order.createdAt) }
  ]

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kenyan-green focus:border-kenyan-green"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <DataTable
          columns={orderColumns}
          data={orders}
          keyField="_id"
          onStatusChange={handleStatusChange}
          isLoading={loading}
        />
      </div>
    </div>
  )
}

export default AdminOrders