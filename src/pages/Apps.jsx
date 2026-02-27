/**
 * pages/Apps.jsx
 * Applications liées : liste des apps Eneo avec rôles et accès.
 */

import React, { useEffect, useState } from 'react'
import { AppWindow, RefreshCw, Layers, Shield } from 'lucide-react'
import { api } from '../api/client'
import { useGlobalToast } from '../context/ToastContext'
import Layout from '../components/layout/Layout'
import Card, { CardHeader } from '../components/ui/Card'
import { RoleBadge } from '../components/ui/Badge'
import { PageLoader } from '../components/ui/Loader'

// ── Initiales d'une app ──────────────────────────────────────────
function AppInitials({ name }) {
  const initials = name
    .split(/[\s-_]+/)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Couleur déterministe selon le nom
  const colors = [
    'bg-eneo-purple-500', 'bg-eneo-gold-400', 'bg-blue-500',
    'bg-teal-500', 'bg-rose-500', 'bg-indigo-500',
  ]
  const color = colors[name.charCodeAt(0) % colors.length]

  return (
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold font-display text-lg">{initials}</span>
    </div>
  )
}

// ── Carte d'une application ──────────────────────────────────────
function AppCard({ app }) {
  const { name, display_name, roles = [], realm_roles = [] } = app
  const label = display_name || name || 'Application'

  return (
    <div className="card p-5 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        <AppInitials name={label} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 font-display text-base truncate">{label}</h3>
          {name !== label && (
            <p className="text-xs text-gray-400 font-mono truncate mt-0.5">{name}</p>
          )}

          {/* Rôles de l'application */}
          {roles.length > 0 && (
            <div className="mt-3">
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-eneo-purple-300 uppercase tracking-widest mb-2">
                <Shield className="w-3 h-3" />
                Rôles application
              </p>
              <div className="flex flex-wrap gap-1.5">
                {roles.map((role, i) => (
                  <RoleBadge key={i} role={typeof role === 'string' ? role : role.name || String(role)} />
                ))}
              </div>
            </div>
          )}

          {/* Rôles realm */}
          {realm_roles.length > 0 && (
            <div className="mt-3">
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-2">
                <Layers className="w-3 h-3" />
                Rôles realm
              </p>
              <div className="flex flex-wrap gap-1.5">
                {realm_roles.map((role, i) => (
                  <RoleBadge key={i} role={typeof role === 'string' ? role : role.name || String(role)} />
                ))}
              </div>
            </div>
          )}

          {roles.length === 0 && realm_roles.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">Accès basique — aucun rôle spécifique</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page Apps ─────────────────────────────────────────────────────
export default function Apps() {
  const { toast }       = useGlobalToast()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadApps = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const { data } = await api.getApps()
      setApps(data?.results || data || [])
    } catch {
      toast.error('Impossible de charger les applications.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadApps() }, [])

  return (
    <Layout>
      <div className="space-y-6 page-enter">

        {/* ── En-tête ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="section-title text-2xl">Applications liées</h1>
            <p className="section-subtitle">Vos accès aux applications Eneo Group</p>
          </div>
          <button
            onClick={() => loadApps(true)}
            disabled={refreshing}
            className="btn-secondary flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        {/* ── Liste ── */}
        {loading ? (
          <PageLoader message="Chargement des applications…" />
        ) : apps.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <AppWindow className="w-14 h-14 text-eneo-purple-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-600">Aucune application liée</p>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed max-w-xs mx-auto">
                Vous n'avez accès à aucune application Eneo Group pour le moment.
                Contactez votre administrateur.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Compteur */}
            <div className="flex items-center gap-2">
              <span className="badge-purple">
                {apps.length} application{apps.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Grille d'apps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {apps.map((app, i) => (
                <AppCard key={app.id || app.name || i} app={app} />
              ))}
            </div>
          </>
        )}

        {/* ── Note informative ── */}
        {!loading && apps.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-eneo-purple-50 border border-eneo-purple-100">
            <Shield className="w-5 h-5 text-eneo-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-eneo-purple-600 leading-relaxed">
              Les accès et rôles sont gérés par votre administrateur Eneo SSO.
              Pour demander un accès à une nouvelle application, contactez votre responsable IT.
            </p>
          </div>
        )}

      </div>
    </Layout>
  )
}
