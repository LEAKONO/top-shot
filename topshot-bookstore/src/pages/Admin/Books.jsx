import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import DataTable from '../../components/admin/DataTable'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { booksAPI } from '../../api/books'
import { formatCurrency } from '../../utils/formatCurrency'

const AdminBooks = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    genre: '',
    stock: '',
    image: ''
  })

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await booksAPI.getBooks({ limit: 100 })
      setBooks(response.data.data)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingBook(null)
    setFormData({
      title: '',
      author: '',
      description: '',
      price: '',
      genre: '',
      stock: '',
      image: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description || '',
      price: book.price,
      genre: book.genre,
      stock: book.stock,
      image: book.image || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingBook) {
        await booksAPI.updateBook(editingBook._id, formData)
      } else {
        await booksAPI.createBook(formData)
      }
      setIsModalOpen(false)
      fetchBooks() // Refresh the list
    } catch (error) {
      console.error('Error saving book:', error)
    }
  }

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await booksAPI.deleteBook(bookId)
        fetchBooks() // Refresh the list
      } catch (error) {
        console.error('Error deleting book:', error)
      }
    }
  }

  const bookColumns = [
    { field: 'title', header: 'Title' },
    { field: 'author', header: 'Author' },
    { field: 'genre', header: 'Genre' },
    { field: 'price', header: 'Price', render: (book) => formatCurrency(book.price) },
    { field: 'stock', header: 'Stock' },
    { field: 'createdAt', header: 'Created', render: (book) => new Date(book.createdAt).toLocaleDateString() }
  ]

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Books Management</h1>
          <Button onClick={handleCreate}>
            Add New Book
          </Button>
        </div>

        <DataTable
          columns={bookColumns}
          data={books}
          keyField="_id"
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={loading}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBook ? 'Edit Book' : 'Add New Book'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            
            <Input
              label="Author"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (KES)"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
              
              <Input
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kenyan-green focus:border-kenyan-green"
                required
              >
                <option value="">Select Genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Biography">Biography</option>
                <option value="Business">Business</option>
                <option value="Children">Children</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <Input
              label="Image URL"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kenyan-green focus:border-kenyan-green"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingBook ? 'Update Book' : 'Create Book'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}

export default AdminBooks