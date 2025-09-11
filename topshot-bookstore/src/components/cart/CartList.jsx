import { useCart } from '../../contexts/CartContext'
import Button from '../ui/Button'
import { formatCurrency } from '../../utils/formatCurrency'

const CartList = ({ items, variant = 'full' }) => {
  const { updateQuantity, removeFromCart } = useCart()

  const handleQuantityChange = (bookId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(bookId)
    } else {
      updateQuantity(bookId, newQuantity)
    }
  }

  if (variant === 'mini') {
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.bookId || item._id} className="flex items-center space-x-3">
            <img
              src={item.book?.image || '/default-book.jpg'}
              alt={item.book?.title}
              className="w-12 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{item.book?.title}</h4>
              <p className="text-xs text-gray-600">Qty: {item.qty}</p>
              <p className="text-sm font-semibold text-kenyan-green">
                {formatCurrency(item.book?.price * item.qty)}
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.bookId || item._id} className="flex items-center space-x-4 p-4 border rounded-lg">
          <img
            src={item.book?.image || '/default-book.jpg'}
            alt={item.book?.title}
            className="w-16 h-20 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{item.book?.title}</h3>
            <p className="text-gray-600">by {item.book?.author}</p>
            <p className="text-kenyan-green font-semibold">
              {formatCurrency(item.book?.price)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(item.bookId || item.book?._id, item.qty - 1)}
            >
              -
            </Button>
            <span className="w-8 text-center">{item.qty}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(item.bookId || item.book?._id, item.qty + 1)}
              disabled={item.qty >= (item.book?.stock || 0)}
            >
              +
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFromCart(item.bookId || item.book?._id)}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  )
}

export default CartList