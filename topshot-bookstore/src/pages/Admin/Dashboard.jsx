import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import StatCard from '../../components/admin/StatCard'
import DataTable from '../../components/admin/DataTable'
import { adminAPI } from '../../api/admin'
import { ordersAPI } from '../../api/orders' 
import { formatCurrency } from '../../utils/formatCurrency'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [analyticsResponse, ordersResponse] = await Promise.all([
        adminAPI.getAnalyticsSummary(),
        ordersAPI.getOrders({ limit: 5 }) // <-- fetch recent orders using ordersAPI
      ])
      
      setStats(analyticsResponse.data.data)
      setRecentOrders(ordersResponse.data.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const orderColumns = [
    { field: '_id', header: 'Order ID', render: (order) => order._id.slice(-8) },
    { field: 'customer.name', header: 'Customer', render: (order) => order.customer?.name || 'N/A' },
    { field: 'total', header: 'Amount', render: (order) => formatCurrency(order.total) },
    { field: 'paymentStatus', header: 'Status' },
    { field: 'createdAt', header: 'Date', render: (order) => new Date(order.createdAt).toLocaleDateString() }
  ]

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.summary?.totalRevenue || 0)}
            icon="💰"
            trend={{ isPositive: true, value: 12.5, description: 'from last month' }}
          />
          <StatCard
            title="Total Orders"
            value={stats?.summary?.totalOrders || 0}
            icon="📦"
            trend={{ isPositive: true, value: 8.3, description: 'from last month' }}
          />
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(stats?.summary?.avgOrderValue || 0)}
            icon="📊"
            trend={{ isPositive: true, value: 4.2, description: 'from last month' }}
          />
          <StatCard
            title="Active Users"
            value="1,234"
            icon="👥"
            trend={{ isPositive: true, value: 5.7, description: 'from last week' }}
          />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <DataTable
            columns={orderColumns}
            data={recentOrders}
            keyField="_id"
            isLoading={loading}
          />
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Best Sellers</h2>
          <div className="space-y-4">
            {stats?.bestSellers?.slice(0, 5).map((book, index) => (
              <div key={book._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-kenyan-green">#{index + 1}</span>
                  <img
                    src={book.bookDetails?.image || '/default-book.jpg'}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.totalSold} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-kenyan-green">
                    {formatCurrency(book.totalRevenue)}
                  </p>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
