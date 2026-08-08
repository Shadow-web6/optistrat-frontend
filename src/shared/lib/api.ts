import axios from 'axios'

// Client API centralisé — toutes les requêtes vers le backend Laravel
// passent par ici, avec injection automatique du token Sanctum.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('optistrat_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('optistrat_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
