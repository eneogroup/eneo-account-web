/**
 * pages/DangerZone.jsx
 * Zone de danger — RGPD (export), désactivation (soft delete), suppression définitive.
 */

import React, { useState } from 'react'
import {
  AlertTriangle, Trash2, ShieldOff, AlertOctagon,
  Download, FileJson, CheckCircle2,
} from 'lucide-react'
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
    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
      <Icon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-0.5">{title}</p>
        <p className="text-sm text-red-600 dark:text-red-400/80 leading-relaxed">{children}</p>
      </div>
    </div>
  )
}

// ── Section Export RGPD ──────────────────────────────────────────
function ExportSection() {
  const [isExporting, setIsExporting] = useState(false)
  const [done, setDone]               = useState(false)
  const { toast } = useGlobalToast()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await api.exportData()
      // Le blob reçu est JSON — on le télécharge directement
      const url = URL.createObjectURL(response.data)
      const a   = document.createElement('a')
      a.href = url
      a.download = `eneo-account-export-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setDone(true)
      toast.success('Vos données ont été téléchargées avec succès.')
      setTimeout(() => setDone(false), 4000)
    } catch {
      toast.error("Erreur lors de l'export. Réessayez.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center">
          <FileJson className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-[var(--color-text)]">
            Exporter mes données
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">Conforme RGPD — Article 20</p>
        </div>
      </div>

      <p className="text-sm text-[var(--color-text-muted)] mb-5 leading-relaxed">
        Téléchargez une copie de toutes vos données personnelles : profil, historique des
        modifications, adresse et sessions actives. Le fichier est au format <strong className="text-[var(--color-text-2)]">JSON</strong>.
      </p>

      <button
        onClick={handleExport}
        disabled={isExporting}
        className="btn-primary"
      >
        {isExporting ? (
          <><Spinner size="sm" color="white" />Export en cours…</>
        ) : done ? (
          <><CheckCircle2 className="w-4 h-4" />Téléchargé !</>
        ) : (
          <><Download className="w-4 h-4" />Télécharger mes données</>
        )}
      </button>
    </Card>
  )
}

// ── Section Désactivation (Soft Delete) ─────────────────────────
function SoftDeleteSection({ displayName, onDelete, isDeleting }) {
  const [step, setStep]             = useState(1)
  const [inputValue, setInputValue] = useState('')
  const isConfirmed = inputValue === CONFIRM_WORD

  return (
    <Card className="border-orange-200 dark:border-orange-900/40">
      {step === 1 && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
              <ShieldOff className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[var(--color-text)]">
                Désactiver le compte
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Vos données sont conservées — réactivation possible
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <WarningBlock icon={ShieldOff} title="Accès immédiatement révoqué">
              Vous perdrez l'accès à toutes les applications Eneo Group dès la confirmation.
            </WarningBlock>
            <WarningBlock icon={AlertTriangle} title="Données conservées 30 jours">
              Votre compte reste désactivé pendant 30 jours avant suppression automatique.
              Contactez le support pour le réactiver pendant cette période.
            </WarningBlock>
          </div>

          <button onClick={() => setStep(2)} className="btn-danger">
            <ShieldOff className="w-4 h-4" />
            Désactiver mon compte
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-orange-600 dark:text-orange-400">
                Confirmation de désactivation
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">Compte : <strong>{displayName}</strong></p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 mb-5">
            <p className="text-sm text-orange-700 dark:text-orange-400 leading-relaxed">
              Saisissez{' '}
              <code className="font-mono font-bold bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded">
                {CONFIRM_WORD}
              </code>{' '}
              pour confirmer la désactivation de <strong>{displayName}</strong>.
            </p>
          </div>

          <div className="mb-6">
            <label className="label text-orange-600">Confirmation</label>
            <input
              type="text"
              className="input"
              value={inputValue}
              onChange={e => setInputValue(e.target.value.toUpperCase())}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { setStep(1); setInputValue('') }}
              className="btn-secondary flex-1 justify-center"
              disabled={isDeleting}
            >
              Annuler
            </button>
            <button
              onClick={() => onDelete('soft')}
              disabled={!isConfirmed || isDeleting}
              className={`flex-1 justify-center btn transition-all duration-200 ${
                isConfirmed && !isDeleting
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-orange-200 dark:bg-orange-900/30 text-orange-400 cursor-not-allowed'
              }`}
            >
              {isDeleting
                ? <><Spinner size="sm" color="white" />Désactivation…</>
                : <><ShieldOff className="w-4 h-4" />Désactiver</>
              }
            </button>
          </div>
        </>
      )}
    </Card>
  )
}

// ── Section Suppression Définitive ──────────────────────────────
function PermanentDeleteSection({ displayName, onDelete, isDeleting }) {
  const [step, setStep]             = useState(1)
  const [inputValue, setInputValue] = useState('')
  const PERM_WORD = 'SUPPRIMER DÉFINITIVEMENT'
  const isConfirmed = inputValue === PERM_WORD

  return (
    <Card className="border-red-300 dark:border-red-900/50">
      {step === 1 && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[var(--color-text)]">
                Suppression définitive
              </h2>
              <p className="text-sm text-red-500 font-medium">Irréversible — aucune restauration possible</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <WarningBlock icon={Trash2} title="Suppression physique totale">
              Toutes vos données (profil, historique, sessions, adresse) seront effacées
              définitivement de nos serveurs et de Keycloak.
            </WarningBlock>
            <WarningBlock icon={ShieldOff} title="Perte de tous vos accès">
              Vous perdrez l'accès permanent à Zury, Mosala et toutes les applications Eneo Group.
            </WarningBlock>
            <WarningBlock icon={AlertOctagon} title="Aucun recours possible">
              Contrairement à la désactivation, cette action est irréversible. Aucun support
              ne pourra restaurer votre compte.
            </WarningBlock>
          </div>

          <button onClick={() => setStep(2)} className="btn-danger">
            <Trash2 className="w-4 h-4" />
            Je comprends, supprimer définitivement
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-red-700 dark:text-red-400">
                Confirmation finale
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">Cette action est irréversible</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 mb-5">
            <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
              Saisissez exactement :{' '}
              <code className="font-mono font-bold bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded text-red-800 dark:text-red-300">
                {PERM_WORD}
              </code>{' '}
              pour confirmer la suppression définitive de <strong>{displayName}</strong>.
            </p>
          </div>

          <div className="mb-6">
            <label className="label text-red-600">Confirmation</label>
            <input
              type="text"
              className="input"
              value={inputValue}
              onChange={e => setInputValue(e.target.value.toUpperCase())}
              placeholder={PERM_WORD}
              autoComplete="off"
              spellCheck={false}
            />
            {inputValue && !isConfirmed && (
              <p className="text-xs text-red-500 mt-1.5">
                Saisissez exactement : {PERM_WORD}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { setStep(1); setInputValue('') }}
              className="btn-secondary flex-1 justify-center"
              disabled={isDeleting}
            >
              Annuler
            </button>
            <button
              onClick={() => onDelete('permanent')}
              disabled={!isConfirmed || isDeleting}
              className={`flex-1 justify-center btn transition-all duration-200 ${
                isConfirmed && !isDeleting
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                  : 'bg-red-200 dark:bg-red-900/30 text-red-400 cursor-not-allowed'
              }`}
            >
              {isDeleting
                ? <><Spinner size="sm" color="white" />Suppression…</>
                : <><Trash2 className="w-4 h-4" />Supprimer définitivement</>
              }
            </button>
          </div>
        </>
      )}
    </Card>
  )
}

// ── Page principale ──────────────────────────────────────────────
export default function DangerZone() {
  const { user, profile, logout } = useAuth()
  const { toast }                 = useGlobalToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.preferred_username || 'votre compte'

  const handleDelete = async (type) => {
    setIsDeleting(true)
    try {
      if (type === 'permanent') {
        await api.permanentDelete()
        toast.success('Compte supprimé définitivement.')
      } else {
        await api.deleteAccount()
        toast.success('Compte désactivé avec succès.')
      }
      setTimeout(() => logout(), 1500)
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression.')
      setIsDeleting(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6 page-enter max-w-2xl">

        {/* En-tête */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertOctagon className="w-6 h-6 text-red-500" />
            <h1 className="font-display font-bold text-2xl text-red-600">Zone de danger</h1>
          </div>
          <p className="text-[var(--color-text-muted)] text-sm">
            Les actions ci-dessous sont irréversibles. Procédez avec la plus grande prudence.
          </p>
        </div>

        {/* Export RGPD */}
        <ExportSection />

        {/* Désactivation */}
        <SoftDeleteSection
          displayName={displayName}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />

        {/* Suppression définitive */}
        <PermanentDeleteSection
          displayName={displayName}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />

        <p className="text-xs text-[var(--color-text-light)] text-center leading-relaxed px-4">
          En cas de doute, contactez le support Eneo Group avant de procéder.
        </p>
      </div>
    </Layout>
  )
}
