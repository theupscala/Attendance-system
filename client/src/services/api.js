import axios from 'axios';

const api = axios.create({
  baseURL: 'http://rttdwo6s5npu5ielursfnvqw.187.127.182.214.sslip.io/api', // Coolify backend
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedInfo = JSON.parse(userInfo);
      config.headers.Authorization = `Bearer ${parsedInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
