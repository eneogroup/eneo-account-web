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
        const jwtUser = getUserInfo()
        setUser(jwtUser)
        await loadProfile()
      }
    } catch {
      // Token invalide → on ne redirige pas encore (laisse les pages gérer)
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
    try {
      await api.logout()
    } catch {
      // Ignorer les erreurs API au logout
    }
    setUser(null)
    setProfile(null)
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
