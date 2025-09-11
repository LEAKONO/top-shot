import api from './axios'

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (item) => api.post('/cart', item),
  updateCartItem: (bookId, qty) => api.put(`/cart/${bookId}`, { qty }),
  removeCartItem: (bookId) => api.delete(`/cart/${bookId}`),
  clearCart: () => api.delete('/cart'),
  mergeCart: (guestCart) => api.post('/cart/merge', { items: guestCart }),
}