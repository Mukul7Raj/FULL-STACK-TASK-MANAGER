const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Standard HTTP client with automatic JWT token attachment and error parsing
 */
export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('token');

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // Re-throw with custom message or network offline error
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to the server. Please ensure the backend is running.');
    }
    throw err;
  }
}

// Authentication API Services
export const authApi = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
  getProfile: () => apiRequest('/auth/profile')
};

// Task Management API Services
export const taskApi = {
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/tasks${queryString}`);
  },
  getStats: () => apiRequest('/tasks/stats'),
  createTask: (task) => apiRequest('/tasks', { method: 'POST', body: task }),
  updateTask: (id, updates) => apiRequest(`/tasks/${id}`, { method: 'PUT', body: updates }),
  deleteTask: (id) => apiRequest(`/tasks/${id}`, { method: 'DELETE' })
};
