import axios from 'axios'

// Create Axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('📤 REQUEST:', {
      method: config.method.toUpperCase(),
      url: config.url,
      hasData: !!config.data,
      data: config.data
    })
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📥 RESPONSE:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    })
    return response
  },
  (error) => {
    console.error('=== ERROR EN API ===')
    console.error('URL:', error.config?.url)
    console.error('Método:', error.config?.method?.toUpperCase())
    console.error('Status:', error.response?.status)
    console.error('Data:', error.response?.data)
    console.error('Message:', error.message)
    return Promise.reject(error)
  }
)

export default api
