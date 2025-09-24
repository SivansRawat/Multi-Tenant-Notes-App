import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// Notes API
export const notesAPI = {
  getNotes: async () => {
    const response = await api.get('/api/notes');
    return response.data;
  },

  getNote: async (id) => {
    const response = await api.get(`/api/notes/${id}`);
    return response.data;
  },

  createNote: async (noteData) => {
    const response = await api.post('/api/notes', noteData);
    return response.data;
  },

  updateNote: async (id, noteData) => {
    const response = await api.put(`/api/notes/${id}`, noteData);
    return response.data;
  },

  deleteNote: async (id) => {
    const response = await api.delete(`/api/notes/${id}`);
    return response.data;
  },
};

// Tenants API
export const tenantsAPI = {
  getTenant: async (slug) => {
    const response = await api.get(`/api/tenants/${slug}`);
    return response.data;
  },

  upgradeTenant: async (slug) => {
    const response = await api.post(`/api/tenants/${slug}/upgrade`);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
