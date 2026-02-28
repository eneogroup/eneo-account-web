/**
 * pages/Dashboard.jsx
 * Tableau de bord : résumé profil, raccourcis, dernière session, statut compte.
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, ShieldCheck, AppWindow, AlertTriangle,
  Clock, MapPin, Monitor, ChevronRight,
  CheckCircle, Zap,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../api/client'
import Layout from '../components/layout/Layout'
import Avatar from '../components/ui/Avatar'
import { GradientCard, StatCard, SkeletonCard } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/Badge'
import { PageLoader } from '../components/ui/Loader'

// ── Raccourcis vers les sections ─────────────────────────────────
const SHORTCUTS = [
  {
    path:  '/profile',
    icon:  User,
    label: 'Informations personnelles',
    desc:  'Modifier votre profil et avatar',
    color: 'purple',
  },
  {
    path:  '/security',
    icon:  ShieldCheck,
    label: 'Sécurité & sessions',
    desc:  'Gérer vos appareils connectés',
    color: 'gold',
  },
  {
    path:  '/apps',
    icon:  AppWindow,
    label: 'Applications liées',
    desc:  'Voir vos accès et rôles',
    color: 'green',
  },
]

const COLOR_STYLES = {
  purple: {
    bg:     'bg-eneo-purple-50',
    border: 'border-eneo-purple-100',
    icon:   'text-eneo-purple-500',
    hover:  'hover:border-eneo-purple-300 hover:bg-eneo-purple-50',
    arrow:  'text-eneo-purple-300 group-hover:text-eneo-purple-500',
  },
  gold: {
    bg:     'bg-eneo-gold-50',
    border: 'border-eneo-gold-100',
    icon:   'text-eneo-gold-500',
    hover:  'hover:border-eneo-gold-300 hover:bg-eneo-gold-50',
    arrow:  'text-eneo-gold-300 group-hover:text-eneo-gold-500',
  },
  green: {
    bg:     'bg-green-50',
    border: 'border-green-100',
    icon:   'text-green-500',
    hover:  'hover:border-green-300 hover:bg-green-50',
    arrow:  'text-green-300 group-hover:text-green-500',
  },
}

// ── Carte raccourci ──────────────────────────────────────────────
function ShortcutCard({ item, onClick }) {
  const Icon = item.icon
  const c    = COLOR_STYLES[item.color]

  return (
    <button
      onClick={onClick}
      className={`group card p-5 flex items-center gap-4 w-full text-left
                  transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5
                  border ${c.border} ${c.hover}`}
    >
      <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{item.label}</p>
        <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{item.desc}</p>
      </div>
      <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-all duration-200 group-hover:translate-x-0.5 ${c.arrow}`} />
    </button>
  )
}

// ── Dernière session ─────────────────────────────────────────────
function LastSessionInfo({ session }) {
  if (!session) return null
  const locationStr = [session.city, session.country].filter(Boolean).join(', ')

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-eneo-purple-50 border border-eneo-purple-100">
      <div className="w-9 h-9 rounded-xl bg-white border border-eneo-purple-100 flex items-center justify-center flex-shrink-0">
        <Monitor className="w-4 h-4 text-eneo-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-eneo-purple-800 truncate">
          {session.browser || session.device_name || 'Session active'}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          {locationStr && (
            <span className="flex items-center gap-1 text-xs text-eneo-purple-400">
              <MapPin className="w-3 h-3" />
              {locationStr}
            </span>
          )}
          {session.last_activity && (
            <span className="flex items-center gap-1 text-xs text-eneo-purple-400">
              <Clock className="w-3 h-3" />
              {new Date(session.last_activity).toLocaleString('fr-FR', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>
      <StatusBadge active />
    </div>
  )
}

// ── Page Dashboard ───────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [sessions, setSessions] = useState([])
  const [apps, setApps]         = useState([])
  const [loading, setLoading]   = useState(true)

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.name || user?.preferred_username || 'Utilisateur'

  const email    = user?.email || profile?.email || ''
  const username = user?.preferred_username || ''

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [sessRes, appsRes] = await Promise.allSettled([
          api.getSessions(),
          api.getApps(),
        ])
        if (sessRes.status === 'fulfilled') {
          const raw = sessRes.value.data
          const list = Array.isArray(raw) ? raw : Array.isArray(raw?.results) ? raw.results : []
          setSessions(list)
        }
        if (appsRes.status === 'fulfilled') {
          const raw = appsRes.value.data
          const list = Array.isArray(raw) ? raw : Array.isArray(raw?.results) ? raw.results : []
          setApps(list)
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const safeSessions   = Array.isArray(sessions) ? sessions : []
  const currentSession = safeSessions.find(s => s.is_current)
  const totalSessions  = safeSessions.length

  return (
    <Layout>
      <div className="space-y-6 page-enter">

        {/* ── Hero card profil ── */}
        <GradientCard>
          <div className="flex items-center gap-5">
            <Avatar
              src={profile?.avatar_url}
              name={displayName}
              size="xl"
              ring
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-display font-bold text-2xl text-white truncate">
                  {displayName}
                </h1>
                <CheckCircle className="w-5 h-5 text-eneo-gold-300 flex-shrink-0" />
              </div>
              <p className="text-white/70 text-sm truncate">{email}</p>
              {username && (
                <p className="text-white/50 text-xs font-mono mt-0.5">@{username}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="badge bg-white/15 text-white border-white/20 border">
                  <Zap className="w-3 h-3" />
                  Compte actif
                </span>
                <span className="badge bg-white/15 text-white border-white/20 border">
                  Eneo Group SSO
                </span>
              </div>
            </div>
          </div>
        </GradientCard>

        {/* ── Stats rapides ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} lines={2} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard
              label="Sessions actives"
              value={totalSessions}
              icon={ShieldCheck}
              color="purple"
              trend={currentSession ? 'Dont la session courante' : undefined}
              onClick={() => navigate('/security')}
            />
            <StatCard
              label="Applications"
              value={apps.length}
              icon={AppWindow}
              color="gold"
              trend="Accès Eneo Group"
              onClick={() => navigate('/apps')}
            />
            <StatCard
              label="Profil"
              value={profile?.first_name ? '✓ Complet' : 'À compléter'}
              icon={User}
              color={profile?.first_name ? 'green' : 'purple'}
              onClick={() => navigate('/profile')}
              className="col-span-2 sm:col-span-1"
            />
          </div>
        )}

        {/* ── Dernière session ── */}
        {!loading && currentSession && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Session courante</h2>
              <button
                onClick={() => navigate('/security')}
                className="text-xs font-semibold text-eneo-purple-500 hover:text-eneo-purple-700
                           flex items-center gap-1 transition-colors"
              >
                Tout voir <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <LastSessionInfo session={currentSession} />
          </div>
        )}

        {/* ── Raccourcis ── */}
        <div className="card p-5">
          <h2 className="section-title mb-1">Accès rapide</h2>
          <p className="section-subtitle">Gérez tous les aspects de votre compte Eneo</p>
          <div className="space-y-3">
            {SHORTCUTS.map(item => (
              <ShortcutCard
                key={item.path}
                item={item}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}
