import api from './axios'

export const adminAPI = {
  getAnalyticsSummary: () => api.get('/admin/analytics/summary'),
  getRecentOrders: () => api.get('/admin/analytics/orders'),
  getInventoryStatus: () => api.get('/admin/analytics/inventory'),
}