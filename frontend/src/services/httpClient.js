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
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const originalUrl = error.config?.url || '';
    // Only force logout on 401 if a token was actually sent (avoid clearing on initial unauthenticated optional calls)
    const hadToken = !!localStorage.getItem('authToken');
    if (status === 401 && hadToken) {
      console.warn('401 detected for', originalUrl, '- clearing credentials');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      // Preserve potential doctor object for debugging (comment out if not desired)
      // localStorage.removeItem('doctor');
      if (!originalUrl.includes('/auth/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;
