import { useState, useEffect } from 'react'
import { booksAPI } from '../api/books'

export const useBooks = (initialFilters = {}) => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    fetchBooks()
  }, [filters])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await booksAPI.getBooks(filters)
      setBooks(response.data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  return {
    books,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchBooks
  }
}