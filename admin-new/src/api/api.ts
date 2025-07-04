import axios from "axios"
import { API_URL } from "../shared/constants"

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  maxRedirects: 0,
})

// Add a request interceptor to include the token in requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: unknown) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Only handle 401 errors for authenticated endpoints, not login
    if (error.response?.status === 401 && !error.config?.url?.includes('/admin/auth/login')) {
      localStorage.removeItem("token")
      window.location.reload()
    }
    return Promise.reject(error)
  }
)
