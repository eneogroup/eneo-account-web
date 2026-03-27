/**
 * context/AuthContext.jsx
 * Contexte React global pour l'état d'authentification.
 * Fournit : user, isAuthenticated, isLoading, login, logout
 */

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  isAuthenticated as kcIsAuthenticated,
  getUserInfo,
  redirectToLogin,
  logout as kcLogout,
  clearTokens,
  refreshToken,
  getAccessToken,
} from '../auth/keycloak'
import { api } from '../api/client'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)   // infos JWT décodées
  const [profile, setProfile]     = useState(null)   // profil depuis l'API
  const [isLoading, setIsLoading] = useState(true)
  const [isReady, setIsReady]     = useState(false)  // auth initialisée
  const initRef = useRef(false)

  // ── Initialisation au montage ──────────────────────────────────
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    initAuth()
  }, [])

  async function initAuth() {
    setIsLoading(true)
    try {
      if (kcIsAuthenticated()) {
        // Token encore valide en mémoire
        const jwtUser = getUserInfo()
        setUser(jwtUser)
        await loadProfile()
      } else {
        // Vérifier qu'on n'est pas en train de se déconnecter
        const rt    = sessionStorage.getItem('rt')
        const rtExp = sessionStorage.getItem('rt_exp')
        const hasValidRt = rt && rtExp && Date.now() < Number(rtExp)

        if (hasValidRt) {
          // Refresh silencieux : même session, pas de nouvelle création Keycloak
          const newToken = await refreshToken()
          if (newToken) {
            const jwtUser = getUserInfo()
            setUser(jwtUser)
            await loadProfile()
          }
        }
        // Sinon : pas de rt valide → ProtectedRoute redirigera vers login
      }
    } catch {
      // Silencieux — les pages protégées gèrent la redirection
    } finally {
      setIsLoading(false)
      setIsReady(true)
    }
  }

  // ── Charger le profil depuis l'API ─────────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      const { data } = await api.getProfile()
      setProfile(data)
      return data
    } catch {
      return null
    }
  }, [])

  // ── Login : rediriger vers Keycloak ───────────────────────────
  const login = useCallback(() => {
    redirectToLogin()
  }, [])

  // ── Logout ────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    // 1. Appel API logout (Pendant qu'on a encore le token)
    // On fait un "best effort" : si l'API échoue (ex: token déjà expiré), 
    // on continue quand même vers Keycloak.
    try {
      await api.logout()
    } catch (err) {
      console.warn("Erreur lors du logout API:", err)
    }

    // 2. Vider l'état React
    setUser(null)
    setProfile(null)

    // 3. Redirection Keycloak (qui se chargera de clearTokens)
    // C'est vital de ne pas appeler clearTokens() ICI, sinon kcLogout()
    // ne trouvera plus l'id_token_hint nécessaire pour fermer la session serveur.
    kcLogout()
  }, [])

  // ── Après le callback Keycloak ────────────────────────────────
  const onAuthSuccess = useCallback(async () => {
    const jwtUser = getUserInfo()
    setUser(jwtUser)
    await loadProfile()
  }, [loadProfile])

  // ── Refresh manuel ────────────────────────────────────────────
  const refresh = useCallback(async () => {
    const token = await refreshToken()
    if (token) {
      const jwtUser = getUserInfo()
      setUser(jwtUser)
    }
    return token
  }, [])

  const value = {
    user,
    profile,
    isAuthenticated: kcIsAuthenticated(),
    isLoading,
    isReady,
    accessToken: getAccessToken(),
    login,
    logout,
    onAuthSuccess,
    refresh,
    loadProfile,
    setProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}