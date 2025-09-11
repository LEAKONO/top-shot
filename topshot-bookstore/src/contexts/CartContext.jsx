import { createContext, useContext, useReducer, useEffect } from 'react'
import { cartAPI } from '../api/cart'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, items: action.payload, loading: false }
    case 'ADD_ITEM':
      return { ...state, items: action.payload }
    case 'UPDATE_ITEM':
      return { ...state, items: action.payload }
    case 'REMOVE_ITEM':
      return { ...state, items: action.payload }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

const getInitialCart = () => {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('guestCart')
    return savedCart ? JSON.parse(savedCart) : []
  }
  return []
}

const initialState = {
  items: [],
  loading: false,
  error: null,
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { isAuthenticated } = useAuth()

  // Load guest cart from localStorage on initial load
  useEffect(() => {
    if (!isAuthenticated) {
      const guestCart = getInitialCart()
      dispatch({ type: 'SET_CART', payload: guestCart })
    }
  }, [isAuthenticated])

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      localStorage.setItem('guestCart', JSON.stringify(state.items))
    }
  }, [state.items, isAuthenticated])

  // Fetch user cart when authenticated
  useEffect(() => {
    const fetchUserCart = async () => {
      if (isAuthenticated) {
        dispatch({ type: 'SET_LOADING', payload: true })
        try {
          const response = await cartAPI.getCart()
          dispatch({ type: 'SET_CART', payload: response.data.data.items || [] })
        } catch (error) {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' })
          console.error('Error fetching cart:', error)
        }
      }
    }

    fetchUserCart()
  }, [isAuthenticated])

  const addToCart = async (book, quantity = 1) => {
    const cartItem = {
      bookId: book._id,
      qty: quantity,
      book: book // Store book details for guest users
    }

    if (isAuthenticated) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const response = await cartAPI.addToCart({
          bookId: book._id,
          qty: quantity
        })
        dispatch({ type: 'ADD_ITEM', payload: response.data.data.items })
        toast.success('Added to cart!')
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to add item' })
        toast.error('Failed to add item to cart')
        console.error('Error adding to cart:', error)
      }
    } else {
      // For guest users
      const existingItemIndex = state.items.findIndex(
        item => item.bookId === book._id
      )

      let newItems
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, qty: item.qty + quantity }
            : item
        )
      } else {
        newItems = [...state.items, cartItem]
      }

      dispatch({ type: 'ADD_ITEM', payload: newItems })
      toast.success('Added to cart!')
    }
  }

  const updateQuantity = async (bookId, quantity) => {
    if (quantity < 1) {
      removeFromCart(bookId)
      return
    }

    if (isAuthenticated) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const response = await cartAPI.updateCartItem(bookId, quantity)
        dispatch({ type: 'UPDATE_ITEM', payload: response.data.data.items })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update quantity' })
        toast.error('Failed to update quantity')
        console.error('Error updating cart:', error)
      }
    } else {
      const newItems = state.items.map(item =>
        item.bookId === bookId ? { ...item, qty: quantity } : item
      )
      dispatch({ type: 'UPDATE_ITEM', payload: newItems })
    }
  }

  const removeFromCart = async (bookId) => {
    if (isAuthenticated) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const response = await cartAPI.removeCartItem(bookId)
        dispatch({ type: 'REMOVE_ITEM', payload: response.data.data.items })
        toast.success('Item removed from cart')
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item' })
        toast.error('Failed to remove item')
        console.error('Error removing from cart:', error)
      }
    } else {
      const newItems = state.items.filter(item => item.bookId !== bookId)
      dispatch({ type: 'REMOVE_ITEM', payload: newItems })
      toast.success('Item removed from cart')
    }
  }

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        await cartAPI.clearCart()
        dispatch({ type: 'CLEAR_CART' })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' })
        console.error('Error clearing cart:', error)
      }
    } else {
      dispatch({ type: 'CLEAR_CART' })
    }
  }

  const mergeCart = async () => {
    if (isAuthenticated && state.items.length > 0) {
      try {
        const guestCart = state.items.map(item => ({
          bookId: item.bookId,
          qty: item.qty
        }))
        
        await cartAPI.mergeCart(guestCart)
        const response = await cartAPI.getCart()
        dispatch({ type: 'SET_CART', payload: response.data.data.items })
      } catch (error) {
        console.error('Error merging cart:', error)
      }
    }
  }

  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      const price = item.book ? item.book.price : 0
      return total + price * item.qty
    }, 0)
  }

  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.qty, 0)
  }

  const value = {
    items: state.items,
    loading: state.loading,
    error: state.error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    mergeCart,
    getCartTotal,
    getCartCount,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}