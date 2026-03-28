/**
 * pages/Apps.jsx
 * Applications liées — Style Google Account
 */
import React, { useEffect, useState } from 'react'
import { AppWindow, RefreshCw, Shield, ExternalLink, Layers } from 'lucide-react'
import { api } from '../api/client'
import { useGlobalToast } from '../context/ToastContext'
import Layout from '../components/layout/Layout'
import { PageLoader } from '../components/ui/Loader'

function AppInitials({ name }) {
  const initials = (name || 'A').split(/[\s-_]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const colors   = ['#7B2D8B', '#1A73E8', '#188038', '#E37400', '#D93025', '#6200EE']
  const color    = colors[(name || '').charCodeAt(0) % colors.length]
  return (
    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
         style={{ background: color }}>
      {initials}
    </div>
  )
}

function AppRow({ app }) {
  const { name, display_name, logo_url, url, roles = [], realm_roles = [], is_connected } = app
  const label = display_name || name || 'Application'
  const [expanded, setExpanded] = useState(false)
  const allRoles = [...roles, ...realm_roles]

  return (
    <div className="border-t border-[#E0E0E0] first:border-t-0">
      <div
        className="flex items-center gap-4 px-6 py-4 hover:bg-[#F8F9FA] transition-colors cursor-pointer"
        onClick={() => allRoles.length > 0 && setExpanded(v => !v)}
      >
        {logo_url ? (
          <img src={logo_url} alt={label} className="w-16 h-16 rounded-full object-cover flex-shrink-0 border border-gray-100" />
        ) : (
          <AppInitials name={label} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-[#202124]">{label}</p>
            {is_connected && (
              <span className="badge-green text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                Connecté
              </span>
            )}
          </div>
          {name !== label && (
            <p className="text-sm text-[#9AA0A6] font-mono mt-0.5">{name}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer"
               className="p-2 rounded-full hover:bg-[#F1F3F4] text-[#5F6368] transition-colors"
               onClick={e => e.stopPropagation()}
               title="Ouvrir l'application">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {allRoles.length > 0 && (
            <span className="text-xs text-[#9AA0A6]">{expanded ? '▲' : '▼'}</span>
          )}
        </div>
      </div>

    </div>
  )
}

export default function Apps() {
  const { toast }       = useGlobalToast()
  const [apps, setApps] = useState([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadApps = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const { data } = await api.getApps()
      const raw = data
      setApps(Array.isArray(raw) ? raw : Array.isArray(raw?.apps) ? raw.apps : Array.isArray(raw?.results) ? raw.results : [])
    } catch {
      toast.error('Impossible de charger les applications.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadApps() }, [])

  const connected  = apps.filter(a => a.is_connected)
  const available  = apps.filter(a => !a.is_connected)

  return (
    <Layout>
      <div className="space-y-5 page-enter">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="page-title text-3xl">Services Eneo Group</h1>
            <p className="page-subtitle text-base">Gérez vos accès aux services Eneo Group</p>
          </div>
          <button onClick={() => loadApps(true)} disabled={refreshing} className="btn-ghost flex-shrink-0">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-sm">Actualiser</span>
          </button>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <PageLoader message="Chargement des applications…" />
        ) : apps.length === 0 ? (
          <div className="card-section">
            <div className="text-center py-12">
              <AppWindow className="w-14 h-14 text-[#E0E0E0] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#5F6368]">Aucune application liée</p>
              <p className="text-xs text-[#9AA0A6] mt-1 max-w-xs mx-auto">
                Contactez votre administrateur pour obtenir des accès.
              </p>
            </div>
          </div>
        ) : (
          <>
            {connected.length > 0 && (
              <div>
                <p className="text-sm font-bold text-[#5F6368] uppercase tracking-widest px-1 mb-3">
                  Services actifs — {connected.length}
                </p>
                <div className="card-section">
                  {connected.map((app, i) => <AppRow key={app.id || app.name || i} app={app} />)}
                </div>
              </div>
            )}

            {available.length > 0 && (
              <div>
                <p className="text-sm font-bold text-[#5F6368] uppercase tracking-widest px-1 mb-3">
                  Autres services — {available.length}
                </p>
                <div className="card-section">
                  {available.map((app, i) => <AppRow key={app.id || app.name || i} app={app} />)}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F8F9FA] border border-[#E0E0E0]">
              <Shield className="w-4 h-4 text-[#5F6368] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#5F6368]">
                L'accès à ces services est géré par votre administrateur Eneo SSO.
                Pour demander l'accès à un nouveau service, contactez votre responsable IT.
              </p>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
