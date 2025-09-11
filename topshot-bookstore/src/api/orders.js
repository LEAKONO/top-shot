import api from './axios'

export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params = {}) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  getMyOrders: () => api.get('/orders/my'),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}