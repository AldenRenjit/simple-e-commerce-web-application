import axios from 'axios';

// Create central axios client
const api = axios.create({
  baseURL: '/api', // Relative path since they are served from same host & port!
  withCredentials: true, // Crucial for receiving/sending HTTP-only cookie
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to format errors uniformly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Collect server response error message if available
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred.';
    return Promise.reject({
      ...error,
      message,
      status: error.response?.status
    });
  }
);

export default api;
export { api };
