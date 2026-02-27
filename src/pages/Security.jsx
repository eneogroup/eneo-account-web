/**
 * pages/Security.jsx
 * Sécurité & sessions : liste paginée, révocation, déconnexion.
 */

import React, { useEffect, useState, useCallback } from 'react'
import { ShieldCheck, Trash2, LogOut, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { useGlobalToast } from '../context/ToastContext'
import Layout from '../components/layout/Layout'
import Card, { CardHeader } from '../components/ui/Card'
import SessionCard from '../components/ui/SessionCard'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { PageLoader, Spinner } from '../components/ui/Loader'

const PAGE_SIZE = 5

export default function Security() {
  const { logout } = useAuth()
  const { toast }  = useGlobalToast()

  const [sessions, setSessions]     = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [revoking, setRevoking]     = useState(null) // id de la session en cours de révocation

  // Dialogs
  const [confirmRevokeId, setConfirmRevokeId]     = useState(null)
  const [confirmRevokeAll, setConfirmRevokeAll]   = useState(false)
  const [confirmLogout, setConfirmLogout]         = useState(false)

  // ── Chargement des sessions ────────────────────────────────────
  const loadSessions = useCallback(async (p = 1, silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const { data } = await api.getSessions(p)
      const results  = data?.results || data || []
      setSessions(results)
      setTotal(data?.count || results.length)
      setPage(p)
    } catch {
      toast.error('Impossible de charger les sessions.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadSessions(1) }, [])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // ── Révoquer une session ───────────────────────────────────────
  const handleRevoke = async (id) => {
    setRevoking(id)
    setConfirmRevokeId(null)
    try {
      await api.revokeSession(id)
      setSessions(prev => prev.filter(s => s.id !== id))
      setTotal(prev => prev - 1)
      toast.success('Session révoquée.')
    } catch {
      toast.error('Impossible de révoquer la session.')
    } finally {
      setRevoking(null)
    }
  }

  // ── Révoquer toutes les sessions ───────────────────────────────
  const handleRevokeAll = async () => {
    setConfirmRevokeAll(false)
    setLoading(true)
    try {
      await api.revokeAllSessions()
      toast.success('Toutes les sessions ont été révoquées.')
      await loadSessions(1, false)
    } catch {
      toast.error('Impossible de révoquer toutes les sessions.')
      setLoading(false)
    }
  }

  // ── Déconnexion ────────────────────────────────────────────────
  const handleLogout = async () => {
    setConfirmLogout(false)
    try {
      await api.logout()
    } catch { /* silencieux */ }
    logout()
  }

  // ── Session courante ───────────────────────────────────────────
  const currentSession = sessions.find(s => s.is_current)
  const otherSessions  = sessions.filter(s => !s.is_current)

  return (
    <Layout>
      <div className="space-y-6 page-enter">

        {/* ── En-tête ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="section-title text-2xl">Sécurité & sessions</h1>
            <p className="section-subtitle">Gérez vos appareils connectés et vos accès</p>
          </div>
          <button
            onClick={() => loadSessions(page, true)}
            disabled={refreshing}
            className="btn-secondary flex-shrink-0"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        {/* ── Actions globales ── */}
        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setConfirmRevokeAll(true)}
              className="btn-secondary flex-1 justify-center text-red-500 hover:bg-red-50 hover:border-red-200"
              disabled={otherSessions.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Révoquer toutes les sessions
            </button>
            <button
              onClick={() => setConfirmLogout(true)}
              className="btn-primary flex-1 justify-center"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        </Card>

        {/* ── Liste sessions ── */}
        {loading ? (
          <PageLoader message="Chargement des sessions…" />
        ) : sessions.length === 0 ? (
          <Card>
            <div className="text-center py-10">
              <ShieldCheck className="w-12 h-12 text-eneo-purple-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucune session active</p>
              <p className="text-sm text-gray-400 mt-1">Toutes les sessions ont été révoquées.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">

            {/* Session courante */}
            {currentSession && (
              <div>
                <p className="text-xs font-bold text-eneo-purple-300 uppercase tracking-widest mb-2 px-1">
                  Session courante
                </p>
                <SessionCard
                  session={currentSession}
                  onRevoke={() => {}}
                  isRevoking={false}
                />
              </div>
            )}

            {/* Autres sessions */}
            {otherSessions.length > 0 && (
              <div>
                <p className="text-xs font-bold text-eneo-purple-300 uppercase tracking-widest mb-2 px-1">
                  Autres sessions ({otherSessions.length})
                </p>
                <div className="space-y-3">
                  {otherSessions.map(session => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onRevoke={(id) => setConfirmRevokeId(id)}
                      isRevoking={revoking === session.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Page {page} sur {totalPages} · {total} session{total > 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadSessions(page - 1)}
                    disabled={page === 1 || loading}
                    className="btn-secondary px-3 py-2 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => loadSessions(page + 1)}
                    disabled={page === totalPages || loading}
                    className="btn-secondary px-3 py-2 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Dialogs de confirmation ── */}
        <ConfirmDialog
          open={!!confirmRevokeId}
          onClose={() => setConfirmRevokeId(null)}
          onConfirm={() => handleRevoke(confirmRevokeId)}
          title="Révoquer cette session ?"
          message="Cet appareil sera déconnecté immédiatement. L'utilisateur devra se reconnecter."
          confirmLabel="Révoquer"
          danger
          isLoading={!!revoking}
        />

        <ConfirmDialog
          open={confirmRevokeAll}
          onClose={() => setConfirmRevokeAll(false)}
          onConfirm={handleRevokeAll}
          title="Révoquer toutes les sessions ?"
          message="Tous les appareils connectés (sauf la session courante) seront déconnectés immédiatement."
          confirmLabel="Tout révoquer"
          danger
        />

        <ConfirmDialog
          open={confirmLogout}
          onClose={() => setConfirmLogout(false)}
          onConfirm={handleLogout}
          title="Se déconnecter ?"
          message="Vous serez redirigé vers la page de connexion Eneo SSO."
          confirmLabel="Se déconnecter"
          cancelLabel="Annuler"
        />
      </div>
    </Layout>
  )
}
