

import axios from 'axios';

const API = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'https://smart-fertilizer-distribution-system.onrender.com') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Har request ke saath saved token automatically header me attach karega
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
