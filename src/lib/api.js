// src/lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api-sakti-production.up.railway.app/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sakti_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
