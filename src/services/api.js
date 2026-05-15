import axios from 'axios'

// Create Axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Inyecta el JWT token en cada petición 🎫
api.interceptors.request.use(
  (config) => {
    // 1. Obtener el token guardado en localStorage
    const token = localStorage.getItem('userToken')
    
    // 2. Si hay token, agregarlo al header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('📤 REQUEST:', {
      method: config.method.toUpperCase(),
      url: config.url,
      hasData: !!config.data,
      data: config.data,
      hasAuth: !!token
    })
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Detecta cuando el token expira
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
    // Si el servidor devuelve 401, el token expiró o es inválido
    if (error.response && error.response.status === 401) {
      console.warn('⚠️ Token expirado o inválido. Sesión cerrada.')
      // Borrar el token inválido
      localStorage.removeItem('userToken')
      // Redirigir al login (si tienes un sistema de navegación)
      // window.location.href = '/login'
    }
    
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
