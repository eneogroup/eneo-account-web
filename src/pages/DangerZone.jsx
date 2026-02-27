/**
 * pages/DangerZone.jsx
 * Zone de danger : suppression du compte en deux étapes.
 */

import React, { useState } from 'react'
import { AlertTriangle, Trash2, ShieldOff, AlertOctagon } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { useGlobalToast } from '../context/ToastContext'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import { Spinner } from '../components/ui/Loader'

const CONFIRM_WORD = 'SUPPRIMER'

// ── Bloc avertissement ───────────────────────────────────────────
function WarningBlock({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
      <Icon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-700 mb-0.5">{title}</p>
        <p className="text-sm text-red-600 leading-relaxed">{children}</p>
      </div>
    </div>
  )
}

export default function DangerZone() {
  const { user, profile, logout } = useAuth()
  const { toast }                 = useGlobalToast()

  const [step, setStep]           = useState(1)   // 1 = avertissements, 2 = confirmation
  const [inputValue, setInputValue] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.preferred_username || 'votre compte'

  const isConfirmed = inputValue === CONFIRM_WORD

  // ── Suppression ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!isConfirmed) return
    setIsDeleting(true)
    try {
      await api.deleteAccount()
      toast.success('Votre compte a été supprimé.')
      // Attendre un peu pour que le toast soit visible
      setTimeout(() => {
        logout()
      }, 1500)
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression du compte.')
      setIsDeleting(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6 page-enter max-w-2xl">

        {/* ── En-tête ── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertOctagon className="w-6 h-6 text-red-500" />
            <h1 className="font-display font-bold text-2xl text-red-600">Zone de danger</h1>
          </div>
          <p className="text-[var(--color-text-muted)] text-sm">
            Les actions ci-dessous sont irréversibles. Procédez avec la plus grande prudence.
          </p>
        </div>

        {/* ── Étape 1 : Avertissements ── */}
        {step === 1 && (
          <Card className="border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-gray-900">
                  Supprimer le compte
                </h2>
                <p className="text-sm text-gray-500">Compte : <strong>{displayName}</strong></p>
              </div>
            </div>

            {/* Avertissements */}
            <div className="space-y-3 mb-6">
              <WarningBlock icon={AlertTriangle} title="Perte de toutes vos données">
                Votre profil, vos préférences et l'ensemble de vos données personnelles seront définitivement supprimés.
              </WarningBlock>
              <WarningBlock icon={ShieldOff} title="Perte de tous vos accès">
                Vous perdrez l'accès à toutes les applications Eneo Group (Zury, Mosala…) sans possibilité de restauration.
              </WarningBlock>
              <WarningBlock icon={AlertTriangle} title="Action irréversible">
                Cette suppression est permanente. Il n'existe aucun moyen de récupérer votre compte après confirmation.
              </WarningBlock>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="btn-danger flex-1 justify-center"
              >
                <Trash2 className="w-4 h-4" />
                Je comprends, continuer
              </button>
            </div>
          </Card>
        )}

        {/* ── Étape 2 : Confirmation par saisie ── */}
        {step === 2 && (
          <Card className="border-red-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-red-700">
                  Confirmation finale
                </h2>
                <p className="text-sm text-gray-500">Cette action est irréversible</p>
              </div>
            </div>

            {/* Instruction */}
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 mb-5">
              <p className="text-sm text-red-700 leading-relaxed">
                Pour confirmer la suppression de <strong>{displayName}</strong>, saisissez{' '}
                <code className="font-mono font-bold bg-red-100 px-1.5 py-0.5 rounded text-red-800">
                  {CONFIRM_WORD}
                </code>{' '}
                dans le champ ci-dessous.
              </p>
            </div>

            {/* Champ de confirmation */}
            <div className="mb-6">
              <label className="label text-red-600">Confirmation</label>
              <input
                type="text"
                className={`input transition-all duration-200 ${
                  inputValue && !isConfirmed
                    ? 'border-red-300 ring-1 ring-red-200 focus:ring-red-300'
                    : isConfirmed
                    ? 'border-red-500 ring-1 ring-red-300 bg-red-50'
                    : ''
                }`}
                value={inputValue}
                onChange={e => setInputValue(e.target.value.toUpperCase())}
                placeholder={CONFIRM_WORD}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {inputValue && !isConfirmed && (
                <p className="text-xs text-red-500 mt-1.5">
                  Saisissez exactement : {CONFIRM_WORD}
                </p>
              )}
              {isConfirmed && (
                <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Vous êtes sur le point de supprimer définitivement votre compte.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { setStep(1); setInputValue('') }}
                className="btn-secondary flex-1 justify-center"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={!isConfirmed || isDeleting}
                className={`flex-1 justify-center btn transition-all duration-200 ${
                  isConfirmed && !isDeleting
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                    : 'bg-red-200 text-red-400 cursor-not-allowed'
                }`}
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" color="white" />
                    Suppression…
                  </span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer définitivement
                  </>
                )}
              </button>
            </div>
          </Card>
        )}

        {/* ── Note de bas de page ── */}
        <p className="text-xs text-[var(--color-text-light)] text-center leading-relaxed px-4">
          En cas de doute, contactez le support Eneo Group avant de procéder à la suppression.
        </p>
      </div>
    </Layout>
  )
}
