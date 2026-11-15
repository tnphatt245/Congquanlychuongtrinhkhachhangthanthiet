import axios from 'axios';

// Khởi tạo instance kết nối với Backend NestJS
const api = axios.create({
  baseURL: 'http://localhost:3000', 
  timeout: 10000,
});

// Interceptor: Tự động nhét Token vào Header trước khi gửi request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;