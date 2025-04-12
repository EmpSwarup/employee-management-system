import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(
  (config) => {
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

// Response Interceptor
// apiClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Handle unauthorized access
//       console.error("Unauthorized access - redirecting to login.");
//       localStorage.removeItem('authToken'); // Clear potentially invalid token
//       // Prevent infinite loops if login page itself causes 401
//       if (window.location.pathname !== '/login') {
//          window.location.href = '/login'; // Force reload to clear state
//       }
//     }
//     return Promise.reject(error); // Reject the promise for component-level handling
//   }
// );

export default apiClient;