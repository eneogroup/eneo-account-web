/**
 * hooks/useAuth.js
 * Hook pour consommer le contexte d'authentification.
 * Usage : const { user, isAuthenticated, login, logout } = useAuth()
 */

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un <AuthProvider>')
  }
  return context
}
