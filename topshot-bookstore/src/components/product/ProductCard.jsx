import { motion } from 'framer-motion'
import { useCart } from '../../contexts/CartContext'
import Button from '../ui/Button'
import { formatCurrency } from '../../utils/formatCurrency'

const ProductCard = ({ book }) => {
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(book, 1)
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="aspect-w-3 aspect-h-4 w-full">
        <img
          src={book.image || '/default-book.jpg'}
          alt={book.title}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{book.title}</h3>
        <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-kenyan-green font-bold text-lg">
            {formatCurrency(book.price)}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            book.stock > 10 ? 'bg-green-100 text-green-800' : 
            book.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`}>
            {book.stock > 10 ? 'In Stock' : book.stock > 0 ? 'Low Stock' : 'Out of Stock'}
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={handleAddToCart}
          disabled={book.stock === 0}
        >
          {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </motion.div>
  )
}

export default ProductCard