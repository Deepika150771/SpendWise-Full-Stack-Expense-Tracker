import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spendwise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      localStorage.removeItem('spendwise_token');
      localStorage.removeItem('spendwise_user');
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  demoLogin: () => api.post('/auth/demo'),
  getMe: () => api.get('/auth/me'),
};

// Transaction Endpoints
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getCategories: () => api.get('/transactions/categories'),
};

// Dashboard Endpoints
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
