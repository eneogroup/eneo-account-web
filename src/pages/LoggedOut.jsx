/**
 * pages/LoggedOut.jsx
 * Page de destination après déconnexion Keycloak.
 *
 * Pourquoi cette page existe :
 *   Sans elle, Keycloak redirecte vers "/" → App redirecte vers "/dashboard"
 *   → ProtectedRoute appelle login() → Keycloak voit sa SSO session encore
 *   active → ré-authentifie silencieusement → l'utilisateur revient au
 *   dashboard sans avoir saisi ses identifiants.
 *
 *   Cette page est NON protégée et ne redirige jamais automatiquement.
 *   L'utilisateur doit cliquer explicitement pour se reconnecter.
 */

import React, { useEffect } from 'react'
import { clearTokens, redirectToLogin } from '../auth/keycloak'
import { LogOut, ShieldCheck } from 'lucide-react'

export default function LoggedOut() {
  // Sécurité : nettoyer tout token résiduel au montage de cette page.
  // (Au cas où la navigation n'aurait pas tout effacé.)
  useEffect(() => {
    clearTokens()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="card p-10 max-w-sm w-full text-center space-y-6">

        {/* Icône */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-eneo-purple-50 border border-eneo-purple-100 flex items-center justify-center">
            <LogOut className="w-7 h-7 text-eneo-purple-500" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="font-display font-bold text-xl text-[var(--color-text)]">
            Déconnexion réussie
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            Vous avez bien été déconnecté de votre compte Eneo Group.
            Toutes vos sessions ont été fermées.
          </p>
        </div>

        {/* Info sécurité */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-green-50 border border-green-100 text-left">
          <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-700 leading-relaxed">
            Votre session SSO Eneo a été révoquée. Vos données restent sécurisées.
          </p>
        </div>

        {/* Bouton reconnexion */}
        <button
          onClick={() => redirectToLogin()}
          className="btn-primary w-full justify-center"
        >
          Se reconnecter
        </button>

      </div>
    </div>
  )
}
