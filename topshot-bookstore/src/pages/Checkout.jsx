import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { ordersAPI } from '../api/orders'
import CheckoutSummary from '../components/cart/CheckoutSummary'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const Checkout = () => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [shippingData, setShippingData] = useState({
    address: '',
    city: '',
    country: 'Kenya'
  })
  const [paymentStatus, setPaymentStatus] = useState('idle') // idle, processing, success, failed
  const [order, setOrder] = useState(null)
  
  const { items, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handlePayment = async () => {
    setLoading(true)
    setPaymentStatus('processing')
    
    try {
      const orderData = {
        items: items.map(item => ({
          book: item.bookId || item.book._id,
          qty: item.qty
        })),
        shippingFee: 100,
        shippingAddress: shippingData
      }
      
      const response = await ordersAPI.createOrder(orderData)
      setOrder(response.data.data)
      
      // Simulate MPESA payment process
      if (import.meta.env.VITE_MOCK_MPESA === 'true') {
        setTimeout(() => {
          setPaymentStatus('success')
          clearCart()
          toast.success('Payment successful! Order confirmed.')
        }, 3000)
      } else {
        // In a real implementation, you would poll the server for payment status
        setPaymentStatus('processing')
        toast.success('MPESA request sent. Check your phone to complete payment.')
      }
    } catch (error) {
      setPaymentStatus('failed')
      toast.error('Payment failed. Please try again.')
      console.error('Payment error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (paymentStatus === 'success' && order) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-green-500 mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your order number is <strong>#{order.orderId}</strong>.
          You will receive an email confirmation shortly.
        </p>
        <div className="space-y-4">
          <Button variant="primary" onClick={() => navigate('/profile')}>
            View My Orders
          </Button>
          <Button variant="outline" onClick={() => navigate('/books')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
          
          <div className="flex mb-6">
            <div className={`flex-1 text-center ${step >= 1 ? 'text-kenyan-green' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                step >= 1 ? 'bg-kenyan-green text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Shipping</span>
            </div>
            <div className={`flex-1 text-center ${step >= 2 ? 'text-kenyan-green' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                step >= 2 ? 'bg-kenyan-green text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
            <div className={`flex-1 text-center ${paymentStatus === 'success' ? 'text-kenyan-green' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                paymentStatus === 'success' ? 'bg-kenyan-green text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Confirmation</span>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={user?.name?.split(' ')[0] || ''}
                  disabled
                />
                <Input
                  label="Last Name"
                  value={user?.name?.split(' ').slice(1).join(' ') || ''}
                  disabled
                />
              </div>
              
              <Input
                label="Email"
                type="email"
                value={user?.email || ''}
                disabled
              />
              
              <Input
                label="Phone Number"
                value={user?.phone || ''}
                disabled
              />
              
              <Input
                label="Address"
                value={shippingData.address}
                onChange={(e) => setShippingData(prev => ({
                  ...prev,
                  address: e.target.value
                }))}
                required
                placeholder="Street address"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={shippingData.city}
                  onChange={(e) => setShippingData(prev => ({
                    ...prev,
                    city: e.target.value
                  }))}
                  required
                />
                <Input
                  label="Country"
                  value={shippingData.country}
                  disabled
                />
              </div>
              
              <Button type="submit" variant="primary" className="w-full">
                Continue to Payment
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Payment Method</h2>
              
              <div className="bg-kenyan-green bg-opacity-10 border border-kenyan-green rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-kenyan-green rounded-full flex items-center justify-center text-white mr-3">
                    📱
                  </div>
                  <h3 className="font-semibold">MPESA Mobile Money</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  You will receive a prompt on your phone to complete the payment.
                </p>
                
                {paymentStatus === 'processing' && (
                  <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
                      <p className="text-yellow-800">
                        Waiting for payment confirmation...
                      </p>
                    </div>
                  </div>
                )}
                
                {paymentStatus === 'failed' && (
                  <div className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
                    <p className="text-red-800">
                      Payment failed. Please try again.
                    </p>
                  </div>
                )}
                
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handlePayment}
                  loading={loading}
                  disabled={paymentStatus === 'processing'}
                >
                  Pay with MPESA
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <CheckoutSummary shippingFee={100} />
      </div>
    </div>
  )
}

export default Checkout