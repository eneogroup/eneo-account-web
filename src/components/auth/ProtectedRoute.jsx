/**
 * components/auth/ProtectedRoute.jsx
 * Protège les routes : redirige vers Keycloak si non authentifié.
 */

import React, { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

// Loader plein écran pendant la vérification
function FullScreenLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-5">
        {/* Logo animé */}
        <div className="avatar-ring">
          <div className="w-14 h-14 rounded-full bg-eneo-purple-500 flex items-center justify-center">
            <span className="text-xl font-display font-bold text-white">E</span>
          </div>
        </div>

        {/* Spinner */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-eneo-purple-400 animate-pulse-soft"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        <p className="text-sm text-[var(--color-text-muted)] font-medium">
          Vérification de votre session…
        </p>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isReady, login } = useAuth()

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      login()
    }
  }, [isReady, isAuthenticated, login])

  if (!isReady) {
    return <FullScreenLoader />
  }

  if (!isAuthenticated) {
    return <FullScreenLoader /> // Redirection en cours
  }

  return children
}
