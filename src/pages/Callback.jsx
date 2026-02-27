/**
 * pages/Callback.jsx
 * Gère le retour de Keycloak après authentification (PKCE).
 * Échange le code contre un token puis redirige vers /dashboard.
 */

import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCodeForTokens } from '../auth/keycloak'
import { useAuth } from '../hooks/useAuth'
import { LoadingDots } from '../components/ui/Loader'

export default function Callback() {
  const navigate        = useNavigate()
  const { onAuthSuccess } = useAuth()
  const [error, setError] = useState(null)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const code   = params.get('code')
    const state  = params.get('state')
    const errParam = params.get('error')

    if (errParam) {
      setError(params.get('error_description') || 'Authentification refusée par le serveur SSO.')
      return
    }

    if (!code) {
      setError('Code d\'autorisation manquant dans la réponse Keycloak.')
      return
    }

    async function handleCallback() {
      try {
        await exchangeCodeForTokens(code, state)
        await onAuthSuccess()
        // Nettoyer l'URL avant de rediriger
        window.history.replaceState({}, '', '/callback')
        navigate('/dashboard', { replace: true })
      } catch (err) {
        setError(err.message || 'Échec de l\'authentification.')
      }
    }

    handleCallback()
  }, [])

  // ── Erreur ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
        <div className="card p-8 max-w-md w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-gray-900 mb-2">
              Erreur d'authentification
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="btn-primary w-full justify-center"
          >
            Se reconnecter
          </button>
        </div>
      </div>
    )
  }

  // ── Chargement ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] gap-6">
      <div className="avatar-ring">
        <div className="w-16 h-16 rounded-full bg-eneo-purple-500 flex items-center justify-center">
          <span className="text-2xl font-display font-bold text-white">E</span>
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="font-display font-semibold text-eneo-purple-700 text-lg">
          Connexion en cours…
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          Finalisation de votre session Eneo SSO
        </p>
      </div>
      <LoadingDots />
    </div>
  )
}
