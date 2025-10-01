import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const CategoryGridCompact = () => {
  const categories = [
    { id: 'fiction', name: 'Fiction', icon: '📖', color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' },
    { id: 'non-fiction', name: 'Non-Fiction', icon: '🔬', color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' },
    { id: 'african-literature', name: 'African Literature', icon: '🌍', color: 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400' },
    { id: 'children', name: "Children's Books", icon: '👶', color: 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400' },
    { id: 'business', name: 'Business', icon: '💼', color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400' },
    { id: 'history', name: 'History', icon: '🏛️', color: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' },
    { id: 'science', name: 'Science', icon: '🔭', color: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' },
    { id: 'kenyan-authors', name: 'Kenyan Authors', icon: '🇰🇪', color: 'bg-kenyan-light-green dark:bg-kenyan-dark-green text-kenyan-green dark:text-white' },

    { id: 'biography', name: 'Biography', icon: '👤', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' },
    { id: 'christian', name: 'Christian', icon: '✝️', color: 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400' },
    { id: 'studying', name: 'Studying', icon: '📚', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' },
  ]

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Categories
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse our extensive collection of books across all genres and categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={`/books?category=${category.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${category.color} group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-kenyan-green transition-colors">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/books"
            className="inline-flex items-center px-6 py-3 bg-kenyan-green text-white font-semibold rounded-lg hover:bg-kenyan-dark-green transition-colors"
          >
            View All Categories
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CategoryGridCompact
