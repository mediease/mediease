import axios from 'axios';

// Create axios instance with base configuration
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens or other headers
httpClient.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors here (401, 403, 500, etc.)
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default httpClient;
