const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (response.status === 401 || response.status === 403) {
    // If unauthorized or expired token, clear storage and log out
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.endsWith('/login')) {
      window.location.href = '/login';
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
};

export const authService = {
  login: async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  register: async (name, email, password) => {
    const data = await api.post('/auth/register', { name, email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('/login');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  getProfile: () => api.get('/auth/me'),
};

export const developerService = {
  getAll: () => api.get('/developers'),
  getById: (id) => api.get(`/developers/${id}`),
  create: (data) => api.post('/developers', data),
  update: (id, data) => api.put(`/developers/${id}`, data),
  delete: (id) => api.delete(`/developers/${id}`),
  updateAvailability: (id, availability) => api.put(`/developers/${id}/availability`, { availability }),
  getExpertiseOptions: () => api.get('/developers/options'),
};

export const reviewService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/reviews?${params}`);
  },
  getById: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  updateStatus: (id, status) => api.put(`/reviews/${id}/status`, { status }),
  getEligible: (id) => api.get(`/reviews/${id}/eligible`),
  autoAssign: (id) => api.post(`/reviews/${id}/assign`),
  reassign: (id, developerId) => api.post(`/reviews/${id}/reassign`, { developer_id: developerId }),
  getStats: () => api.get('/reviews/stats'),
  getHistory: () => api.get('/reviews/history'),
};
