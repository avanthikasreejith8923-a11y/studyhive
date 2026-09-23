const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('studybee_token');

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('studybee_token', token);
  } else {
    localStorage.removeItem('studybee_token');
  }
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      setAuthToken(null);
    }
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const authAPI = {
  register: (credentials) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  login: (credentials) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => apiFetch('/auth/me'),
};

export const sessionsAPI = {
  create: (data) =>
    apiFetch('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiFetch(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getHistory: () => apiFetch('/sessions'),
  getById: (id) => apiFetch(`/sessions/${id}`),
  getTasks: (sessionId) => apiFetch(`/sessions/${sessionId}/tasks`),
  createTask: (sessionId, text) =>
    apiFetch(`/sessions/${sessionId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
};

export const tasksAPI = {
  update: (taskId, data) =>
    apiFetch(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (taskId) =>
    apiFetch(`/tasks/${taskId}`, {
      method: 'DELETE',
    }),
};

export const shopAPI = {
  getCatalog: () => apiFetch('/shop/items'),
  purchase: (itemId, autoEquip = true) =>
    apiFetch('/shop/purchase', {
      method: 'POST',
      body: JSON.stringify({ itemId, autoEquip }),
    }),
  equip: (itemId) =>
    apiFetch('/shop/equip', {
      method: 'PUT',
      body: JSON.stringify({ itemId }),
    }),
};
