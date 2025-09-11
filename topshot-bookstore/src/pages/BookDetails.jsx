import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { booksAPI } from '../api/books'
import { useCart } from '../contexts/CartContext'
import Button from '../components/ui/Button'
import { formatCurrency } from '../utils/formatCurrency'

const BookDetails = () => {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  useEffect(() => {
    fetchBook()
  }, [id])

  const fetchBook = async () => {
    try {
      setLoading(true)
      const response = await booksAPI.getBook(id)
      setBook(response.data.data)
    } catch (error) {
      setError('Book not found')
      console.error('Error fetching book:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    addToCart(book, quantity)
    setQuantity(1)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Book not found</h3>
        <p className="text-gray-500">The book you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        <div>
          <img
            src={book.image || '/default-book.jpg'}
            alt={book.title}
            className="w-full h-96 object-cover rounded-lg shadow-md"
          />
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
            <div className="inline-block bg-kenyan-green text-white px-3 py-1 rounded-full text-sm mb-4">
              {book.genre}
            </div>
          </div>

          <div className="text-2xl font-bold text-kenyan-green">
            {formatCurrency(book.price)}
          </div>

          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            book.stock > 10 ? 'bg-green-100 text-green-800' : 
            book.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`}>
            {book.stock > 10 ? 'In Stock' : book.stock > 0 ? 'Low Stock' : 'Out of Stock'}
          </div>

          {book.stock > 0 && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-kenyan-green"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                  className="px-3 py-2 text-gray-600 hover:text-kenyan-green"
                  disabled={quantity >= book.stock}
                >
                  +
                </button>
              </div>
              
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                className="flex-1"
              >
                Add to Cart - {formatCurrency(book.price * quantity)}
              </Button>
            </div>
          )}

          {book.description && (
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{book.description}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default BookDetails