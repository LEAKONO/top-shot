import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import CartList from '../components/cart/CartList'
import Button from '../components/ui/Button'
import { formatCurrency } from '../utils/formatCurrency'

const Cart = () => {
  const { items, getCartTotal, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const subtotal = getCartTotal()
  const shippingFee = 100 // Fixed shipping fee
  const total = subtotal + shippingFee

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-600 mb-6">Looks like you haven't added any books to your cart yet.</p>
        <Button as={Link} to="/books" variant="primary">
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Button variant="ghost" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
        
        <CartList items={items} variant="full" />
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total</span>
              <span className="text-kenyan-green">{formatCurrency(total)}</span>
            </div>
          </div>

          {isAuthenticated ? (
            <Button as={Link} to="/checkout" variant="primary" className="w-full">
              Proceed to Checkout
            </Button>
          ) : (
            <div className="space-y-3">
              <Button as={Link} to="/login" variant="primary" className="w-full">
                Login to Checkout
              </Button>
              <p className="text-sm text-gray-600 text-center">
                You need to be logged in to complete your purchase
              </p>
            </div>
          )}

          <div className="mt-4 text-center">
            <Link to="/books" className="text-kenyan-green hover:underline text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart