import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import ProductGrid from '../components/product/ProductGrid'
import { useBooks } from '../hooks/useBooks'

const Home = () => {
  const { books, loading } = useBooks({ limit: 8 })

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-kenyan-green text-white rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-display font-bold mb-6"
            >
              Discover Kenyan Literature
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            >
              Explore stories that celebrate our culture, heritage, and future from the heart of Kenya.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button
                variant="secondary"
                size="lg"
                as={Link}
                to="/books"
              >
                Browse Collection
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Kenyan pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="kenyan-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="50" height="50" fill="#F7ECD5"/>
              <rect x="50" y="0" width="50" height="50" fill="#006600"/>
              <rect x="0" y="50" width="50" height="50" fill="#006600"/>
              <rect x="50" y="50" width="50" height="50" fill="#F7ECD5"/>
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#kenyan-pattern)" />
          </svg>
        </div>
      </section>

      {/* Featured Books */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-display font-bold text-gray-900">Featured Books</h2>
          <Button variant="outline" as={Link} to="/books">
            View All
          </Button>
        </div>
        <ProductGrid books={books} loading={loading} />
      </section>

      {/* Features Section */}
      <section className="bg-white rounded-2xl shadow-md p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2">Free Delivery</h3>
            <p className="text-gray-600">Free delivery on orders over KES 2,000 within Nairobi</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">MPESA Payments</h3>
            <p className="text-gray-600">Secure and convenient MPESA payments</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
            <p className="text-gray-600">Hundreds of Kenyan authors and titles</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home