import { useState, useEffect } from 'react'
import { booksAPI } from '../api/books'
import ProductGrid from '../components/product/ProductGrid'
import Filters from '../components/product/Filters'
import Button from '../components/ui/Button'

const Books = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    author: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 12,
    sort: '-createdAt'
  })
  const [pagination, setPagination] = useState({})
  const [hasMore, setHasMore] = useState(true)

  const filterOptions = [
    {
      id: 'genre',
      label: 'Genre',
      value: filters.genre,
      options: [
        { value: '', label: 'All Genres' },
        { value: 'Fiction', label: 'Fiction' },
        { value: 'Non-Fiction', label: 'Non-Fiction' },
        { value: 'Science', label: 'Science' },
        { value: 'History', label: 'History' },
        { value: 'Biography', label: 'Biography' },
        { value: 'Business', label: 'Business' },
        { value: 'Children', label: 'Children' },
        { value: 'Other', label: 'Other' },
      ]
    },
    {
      id: 'minPrice',
      label: 'Min Price',
      value: filters.minPrice,
      options: [
        { value: '', label: 'Any' },
        { value: '0', label: 'KES 0' },
        { value: '500', label: 'KES 500' },
        { value: '1000', label: 'KES 1,000' },
        { value: '2000', label: 'KES 2,000' },
      ]
    },
    {
      id: 'maxPrice',
      label: 'Max Price',
      value: filters.maxPrice,
      options: [
        { value: '', label: 'Any' },
        { value: '1000', label: 'KES 1,000' },
        { value: '2000', label: 'KES 2,000' },
        { value: '5000', label: 'KES 5,000' },
        { value: '10000', label: 'KES 10,000' },
      ]
    }
  ]

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'title', label: 'Title: A to Z' },
    { value: '-title', label: 'Title: Z to A' },
  ]

  useEffect(() => {
    fetchBooks()
  }, [filters])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await booksAPI.getBooks(filters)
      setBooks(response.data.data)
      setPagination(response.data.pagination)
      setHasMore(response.data.pagination.page < response.data.pagination.pages)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterId, value) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handleSortChange = (sort) => {
    setFilters(prev => ({
      ...prev,
      sort,
      page: 1
    }))
  }

  const handleSearch = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value,
      page: 1
    }))
  }

  const loadMore = () => {
    setFilters(prev => ({
      ...prev,
      page: prev.page + 1
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-gray-900">All Books</h1>
        
        <div className="w-64">
          <input
            type="text"
            placeholder="Search books..."
            value={filters.search}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kenyan-green focus:border-kenyan-green"
          />
        </div>
      </div>

      <Filters
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        onSortChange={handleSortChange}
      />

      <ProductGrid books={books} loading={loading} />

      {hasMore && !loading && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMore}
            isLoading={loading}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

export default Books