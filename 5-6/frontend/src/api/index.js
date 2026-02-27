import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Для обработки ошибок
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      // Уведомления для пользователя
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const userAPI = {
  getAll: () => apiClient.get('/users'),
  getById: (id) => apiClient.get(`/users/${id}`),
  create: (user) => apiClient.post('/users', user),
  update: (id, user) => apiClient.put(`/users/${id}`, user),
  patch: (id, user) => apiClient.patch(`/users/${id}`, user),
  delete: (id) => apiClient.delete(`/users/${id}`),
};

export default apiClient;