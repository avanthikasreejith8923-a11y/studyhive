const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('studyhive_token');

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('studyhive_token', token);
  } else {
    localStorage.removeItem('studyhive_token');
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
  getHistory: (page = 1, limit = 10) => apiFetch(`/sessions?page=${page}&limit=${limit}`),
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

export const hivesAPI = {
  create: (data) =>
    apiFetch('/hives', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  list: () => apiFetch('/hives'),
  getById: (id) => apiFetch(`/hives/${id}`),
  join: (data) =>
    apiFetch('/hives/join', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  leave: (id) =>
    apiFetch(`/hives/${id}/leave`, {
      method: 'POST',
    }),
};

export const friendsAPI = {
  getFriends: () => apiFetch('/friends'),
  getRequests: () => apiFetch('/friends/requests'),
  search: (query) => apiFetch(`/friends/search?q=${encodeURIComponent(query)}`),
  sendRequest: (data) =>
    apiFetch('/friends/request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  acceptRequest: (friendshipId) =>
    apiFetch(`/friends/request/${friendshipId}/accept`, {
      method: 'PUT',
    }),
  rejectRequest: (friendshipId) =>
    apiFetch(`/friends/request/${friendshipId}/reject`, {
      method: 'PUT',
    }),
  cancelOrRemove: (friendshipId) =>
    apiFetch(`/friends/request/${friendshipId}/cancel`, {
      method: 'DELETE',
    }),
};

export const chatAPI = {
  getHistory: (friendId) => apiFetch(`/chat/${friendId}`),
  markRead: (friendId) =>
    apiFetch(`/chat/${friendId}/read`, {
      method: 'PATCH',
    }),
};

export const assistantAPI = {
  chat: (message, history = []) =>
    apiFetch('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),
};

export const adminAPI = {
  getStats: () => apiFetch('/admin/stats'),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/admin/users${query ? `?${query}` : ''}`);
  },
  toggleBan: (userId, isBanned) =>
    apiFetch(`/admin/users/${userId}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ isBanned }),
    }),
  toggleAdmin: (userId, isAdmin) =>
    apiFetch(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ isAdmin }),
    }),
  getHives: () => apiFetch('/admin/hives'),
};


