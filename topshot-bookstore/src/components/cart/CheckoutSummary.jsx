import { useCart } from '../../contexts/CartContext'
import { formatCurrency } from '../../utils/formatCurrency'

const CheckoutSummary = ({ shippingFee = 100 }) => {
  const { items, getCartTotal } = useCart()
  const subtotal = getCartTotal()
  const total = subtotal + shippingFee

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.bookId || item._id} className="flex justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={item.book?.image || '/default-book.jpg'}
                alt={item.book?.title}
                className="w-12 h-16 object-cover rounded"
              />
              <div>
                <h4 className="font-medium">{item.book?.title}</h4>
                <p className="text-sm text-gray-600">Qty: {item.qty}</p>
              </div>
            </div>
            <span className="font-semibold">
              {formatCurrency(item.book?.price * item.qty)}
            </span>
          </div>
        ))}
      </div>
      
      <div className="space-y-2 border-t pt-4">
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
    </div>
  )
}

export default CheckoutSummary