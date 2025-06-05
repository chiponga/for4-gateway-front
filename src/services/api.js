// src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// Configuração base do Axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Erro desconhecido';
    
    // Se o token expirou, redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Mostrar toast de erro apenas se não for um erro de autenticação
    if (error.response?.status !== 401) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Métodos da API organizados por categoria
export const apiMethods = {
  // Autenticação
  auth: {
   // login: (credentials) => api.post('/auth/login', credentials),
    //register: (userData) => api.post('/auth/register', userData),
    //verify: () => api.get('/auth/verify'),
    //forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
  },

  // Dashboard
  dashboard: {
    overview: () => api.get('/dashboard/overview'),
    performance: (period) => api.get(`/dashboard/performance?period=${period}`),
    statement: (filters) => api.get('/dashboard/statement', { params: filters }),
    stats: () => api.get('/dashboard/stats')
  },

  // Financeiro
  financial: {
    balance: () => api.get('/financial/balance'),
    withdrawals: () => api.get('/financial/withdrawals'),
    createWithdrawal: (data) => api.post('/financial/withdrawals', data),
    bankAccounts: () => api.get('/financial/bank-accounts'),
    createBankAccount: (data) => api.post('/financial/bank-accounts', data),
    updateBankAccount: (id, data) => api.put(`/financial/bank-accounts/${id}`, data),
    deleteBankAccount: (id) => api.delete(`/financial/bank-accounts/${id}`)
  },

  // Produtos
  products: {
    list: (filters) => api.get('/products', { params: filters }),
    get: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    sales: (id, filters) => api.get(`/products/${id}/sales`, { params: filters })
  },

  // Afiliados
  affiliates: {
    list: () => api.get('/affiliates'),
    requests: () => api.get('/affiliates/requests'),
    approve: (id) => api.post(`/affiliates/requests/${id}/approve`),
    reject: (id) => api.post(`/affiliates/requests/${id}/reject`),
    myStats: () => api.get('/affiliates/my-stats'),
    commission: () => api.get('/affiliates/commission')
  },

  // Integrações
  integrations: {
    list: () => api.get('/integrations'),
    connect: (integration, config) => api.post(`/integrations/${integration}/connect`, config),
    disconnect: (integration) => api.post(`/integrations/${integration}/disconnect`),
    test: (integration) => api.post(`/integrations/${integration}/test`)
  },

  // Marketplace
  marketplace: {
    products: (filters) => api.get('/marketplace/products', { params: filters }),
    categories: () => api.get('/marketplace/categories'),
    affiliate: (productId) => api.post(`/marketplace/products/${productId}/affiliate`)
  },

  // Configurações
  settings: {
    profile: () => api.get('/settings/profile'),
    updateProfile: (data) => api.put('/settings/profile', data),
    changePassword: (data) => api.post('/settings/change-password', data),
    notifications: () => api.get('/settings/notifications'),
    updateNotifications: (data) => api.put('/settings/notifications', data)
  }
};

// Função helper para upload de arquivos
export const uploadFile = async (file, path = '') => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post(`/uploads${path}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Função helper para download de arquivos
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    toast.error('Erro ao baixar arquivo');
    throw error;
  }
};

export default api;