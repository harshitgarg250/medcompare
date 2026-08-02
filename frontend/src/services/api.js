import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://medcompare-backend-qyoo.onrender.com/api'

const API = axios.create({
  baseURL: BASE_URL
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API
// AI API

export const askAIWithContext = (question, hospitalId) => 
  API.post('/ai/ask', { question, hospitalId });