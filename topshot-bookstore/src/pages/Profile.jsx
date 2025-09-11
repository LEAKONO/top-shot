import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ordersAPI } from '../api/orders'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/date'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await ordersAPI.getMyOrders()
      setOrders(response.data.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    await updateProfile(profileData)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => {
                setActiveTab('orders')
                if (activeTab !== 'orders') fetchOrders()
              }}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'orders'
                  ? 'border-kenyan-green text-kenyan-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Orders
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'profile'
                  ? 'border-kenyan-green text-kenyan-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                  <p className="text-gray-500">Your order history will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">Order #{order._id.slice(-8)}</h3>
                          <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-kenyan-green">{formatCurrency(order.total)}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.paymentStatus === 'PAID' 
                              ? 'bg-green-100 text-green-800'
                              : order.paymentStatus === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <h4 className="font-medium mb-2">Items:</h4>
                        <ul className="text-sm text-gray-600">
                          {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span>{item.title} × {item.qty}</span>
                              <span>{formatCurrency(item.price * item.qty)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              
              <Input
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                required
              />
              
              <Input
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                required
              />
              
              <Input
                label="Phone Number"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
                required
                pattern="^254[17]\d{8}$"
                title="Phone must be in format 254XXXXXXXXX"
              />
              
              <Button type="submit" variant="primary">
                Update Profile
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile