import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // manda las cookies en cada request (refresh token)
})

// Interceptor de request
// Agrega el access token al header de cada request automáticamente
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Interceptor de response
// Si el backend responde 401, renueva el token y reintenta
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    console.log('----> Axios Intercept! <------------')
    console.log('Request: ', originalRequest)

    // Si el error es 401 y no es el endpoint de refresh
    // (evita loop infinito)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        console.log('¡¡ Hay un refresh encurso !!')
        // Si ya hay un refresh en curso, encola esta request
        // y espera a que termine
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const currentRefreshToken = useAuthStore.getState().refreshToken
        // Llama al endpoint de refresh
        console.log("====> Refrescando el Access Token <====")
        console.log("Refresh Token: ", currentRefreshToken)
        
        const { data } = await api.post<{ accessToken: string, refreshToken: string }>(
          '/auth/refresh',
          { refreshToken: currentRefreshToken }
        )

        // Guarda el nuevo token en Zustand
        useAuthStore.getState().setAccessToken(data.accessToken)
        if (data.refreshToken) {
          useAuthStore.getState().setRefreshToken(data.refreshToken)
        }
        // Procesa la cola de requests que estaban esperando
        processQueue(null, data.accessToken)

        // Reintenta la request original con el nuevo token
        console.log("====> Reintentando <====")
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // El refresh falló, la sesión expiró
        console.log("====> Falló <====")
        console.log(refreshError)
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        console.log("====> Ya no está refrescando <====")
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api