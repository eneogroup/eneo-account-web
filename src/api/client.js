/**
 * api/client.js
 * Instance Axios configurée pour l'API eneo-account.
 * - Injecte automatiquement le Bearer token
 * - Rafraîchit le token si expiré (401)
 * - Gestion centralisée des erreurs
 */

import axios from 'axios'
import { getAccessToken, refreshToken, isTokenExpired, redirectToLogin } from '../auth/keycloak'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://account.eneogroup.com/api/v1'

// ── Instance principale ──────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
})

// ── Request interceptor : injecter le token ──────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    // Rafraîchir proactivement si proche de l'expiration
    if (isTokenExpired()) {
      await refreshToken()
    }

    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ── Variable pour éviter les boucles infinies de refresh ─────────
let _isRefreshing = false
let _failedQueue  = []

function processQueue(error, token = null) {
  _failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  _failedQueue = []
}

// ── Response interceptor : gérer les 401 ────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (_isRefreshing) {
        // Mettre en file d'attente
        return new Promise((resolve, reject) => {
          _failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      _isRefreshing = true

      try {
        const newToken = await refreshToken()
        if (!newToken) {
          // Refresh échoué → rediriger vers login
          processQueue(new Error('Session expirée'), null)
          redirectToLogin()
          return Promise.reject(error)
        }

        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        redirectToLogin()
        return Promise.reject(refreshError)
      } finally {
        _isRefreshing = false
      }
    }

    // Formater l'erreur de manière lisible
    const formattedError = formatApiError(error)
    return Promise.reject(formattedError)
  }
)

// ── Formateur d'erreurs API ──────────────────────────────────────
function formatApiError(error) {
  if (error.response) {
    const { status, data } = error.response
    const message =
      data?.detail ||
      data?.message ||
      data?.error ||
      (typeof data === 'string' ? data : null) ||
      getDefaultMessage(status)

    return {
      status,
      message,
      data: data || null,
      isApiError: true,
    }
  }

  if (error.request) {
    return {
      status: 0,
      message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
      isApiError: true,
    }
  }

  return {
    status: -1,
    message: error.message || 'Une erreur inattendue s\'est produite.',
    isApiError: true,
  }
}

function getDefaultMessage(status) {
  const messages = {
    400: 'Requête invalide.',
    401: 'Session expirée. Veuillez vous reconnecter.',
    403: 'Accès refusé.',
    404: 'Ressource introuvable.',
    409: 'Conflit avec une ressource existante.',
    422: 'Données invalides.',
    429: 'Trop de requêtes. Réessayez dans un moment.',
    500: 'Erreur serveur interne.',
    502: 'Service temporairement indisponible.',
    503: 'Service en maintenance.',
  }
  return messages[status] || `Erreur ${status}`
}

export default apiClient

// ── Endpoints helpers ────────────────────────────────────────────
export const api = {
  // Health
  health: () =>
    axios.get(`${BASE_URL}/health/`), // sans token

  // Profil
  getProfile:        () => apiClient.get('/me/'),
  updateProfile:     (data) => apiClient.patch('/me/profile/', data),
  getProfileHistory: () => apiClient.get('/me/profile/history/'),

  // Avatar
  uploadAvatar: (file) => {
    const form = new FormData()
    form.append('avatar', file)
    return apiClient.post('/me/avatar/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteAvatar: () => apiClient.delete('/me/avatar/'),

  // Adresse
  getAddress:    () => apiClient.get('/me/address/'),
  updateAddress: (data) => apiClient.put('/me/address/', data),

  // Sessions
  getSessions:    (page = 1) => apiClient.get('/me/sessions/', { params: { page } }),
  revokeSession:  (id) => apiClient.delete(`/me/sessions/${id}/`),
  revokeAllSessions: () => apiClient.delete('/me/sessions/'),

  // Logout
  logout: () => apiClient.post('/me/logout/'),

  // Applications
  getApps: () => apiClient.get('/me/apps/'),

  // Suppression de compte
  deleteAccount: () => apiClient.delete('/me/delete/'),
}
