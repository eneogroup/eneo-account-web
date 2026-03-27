/**
 * pages/Activity.jsx
 * Journal d'activités récent - Style Google Account
 */

import React, { useEffect, useState, lazy, Suspense } from 'react'
import {
  History,
  Monitor,
  Smartphone,
  User,
  Lock,
  Camera,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Search,
  MapPin,
} from 'lucide-react'
import { api } from '../api/client'
import Layout from '../components/layout/Layout'
import { SkeletonCard } from '../components/ui/Card'

// Lazy load pour ne pas bloquer si Leaflet n'est pas encore chargé
const ConnectionMap = lazy(() => import('../components/ui/ConnectionMap'))

// ── Composant Icône d'Activité ───────────────────────────────────
function ActivityIcon({ type, icon }) {
  const icons = {
    monitor:    Monitor,
    smartphone: Smartphone,
    user:       User,
    lock:       Lock,
    camera:     Camera,
    'alert-triangle': AlertTriangle,
  }
  
  const colors = {
    profile:    'bg-blue-50 text-blue-600 border-blue-100',
    connection: 'bg-green-50 text-green-600 border-green-100',
    security:   'bg-amber-50 text-amber-600 border-amber-100',
  }

  const IconComp = icons[icon] || History
  const colorClass = colors[type] || 'bg-gray-50 text-gray-600 border-gray-100'

  return (
    <div className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      <IconComp className="w-5 h-5" />
    </div>
  )
}

// ── Item de la Timeline ──────────────────────────────────────────
function ActivityItem({ activity }) {
  const date = new Date(activity.at)
  const isToday = new Date().toDateString() === date.toDateString()
  
  const timeStr = date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
  
  const dateStr = isToday 
    ? "Aujourd'hui" 
    : date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long' 
      })

  return (
    <div className="group flex gap-4 py-4 relative">
      {/* Ligne verticale de la timeline */}
      <div className="absolute left-5 top-14 bottom-0 w-0.5 bg-gray-100 group-last:hidden" />
      
      <ActivityIcon type={activity.type} icon={activity.icon} />
      
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#202124] truncate">
            {activity.title}
          </h3>
          <span className="text-xs text-[#9AA0A6] whitespace-nowrap">
            {dateStr}, {timeStr}
          </span>
        </div>

        <p className="text-sm text-[#5F6368] mt-0.5 leading-relaxed">
          {activity.description}
        </p>

        {activity.ip && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-mono bg-[#F1F3F4] text-[#5F6368] px-1.5 py-0.5 rounded tracking-wider">
              IP: {activity.ip}
            </span>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-4 h-4 text-[#BDC1C6]" />
      </div>
    </div>
  )
}

// ── Page Principale ─────────────────────────────────────────────
export default function Activity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchActivity = async () => {
    try {
      setLoading(true)
      const res = await api.getActivity()
      setActivities(res.data)
      setError(null)
    } catch (err) {
      setError("Impossible de charger l'historique d'activité.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity()
  }, [])

  return (
    <Layout>
      <div className="space-y-5 page-enter">

        {/* ── En-tête ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="page-title">Activité récente</h1>
            <p className="page-subtitle">Consultez les événements de sécurité et modifications de votre compte</p>
          </div>
          <button
            onClick={fetchActivity}
            className="btn-ghost flex-shrink-0"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-sm">Actualiser</span>
          </button>
        </div>

        {/* Barre de recherche style Google */}
        <div className="search-bar">
          <Search className="w-4 h-4 text-[#5F6368] flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher dans l'activité..."
            className="flex-1 bg-transparent text-sm text-[#202124] placeholder:text-[#9AA0A6] outline-none"
            readOnly
          />
        </div>

        {/* ── Carte des connexions ── */}
        {!loading && !error && activities.some(a => a.type === 'connection' && a.lat) && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-eneo-purple-50 dark:bg-eneo-purple-900/30 border border-eneo-purple-100 dark:border-eneo-purple-800 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-eneo-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text)]">Carte des connexions</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Origine géographique de vos connexions</p>
              </div>
            </div>
            <Suspense fallback={
              <div className="flex items-center justify-center h-48 rounded-2xl bg-[var(--color-surface-2)] text-sm text-[var(--color-text-muted)]">
                Chargement de la carte…
              </div>
            }>
              <ConnectionMap activities={activities} />
            </Suspense>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={2} />
          </div>
        ) : error ? (
          <div className="card p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-[#5F6368] mb-4">{error}</p>
            <button onClick={fetchActivity} className="btn-primary inline-flex">
              Réessayer
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="card-section">
            <div className="text-center py-12">
              <History className="w-14 h-14 text-[#E0E0E0] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#5F6368]">Aucune activité</p>
              <p className="text-xs text-[#9AA0A6] mt-1 max-w-xs mx-auto">
                Les modifications de votre profil et vos connexions apparaîtront ici.
              </p>
            </div>
          </div>
        ) : (
          <div className="card-section overflow-hidden">
            <div className="px-6 py-3 bg-[#F8F9FA] border-b border-[#E0E0E0]">
              <span className="text-[10px] font-bold text-[#9AA0A6] uppercase tracking-widest">
                Événements récents
              </span>
            </div>
            <div className="px-6 divide-y divide-[#F1F3F4]">
              {activities.map((item, idx) => (
                <ActivityItem key={idx} activity={item} />
              ))}
            </div>
            <div className="px-6 py-4 bg-[#F8F9FA] text-center border-t border-[#E0E0E0]">
              <button className="text-xs font-semibold text-[#7B2D8B] hover:underline">
                Afficher l'activité plus ancienne
              </button>
            </div>
          </div>
        )}

        {/* Footer info style Google */}
        <div className="p-4 rounded-2xl bg-[#E8F0FE] border border-blue-100 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-[#C5D9F7] flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-[#1A73E8]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#1558B0]">Vous gardez le contrôle</h4>
            <p className="text-xs text-[#1558B0] mt-1 leading-relaxed opacity-80">
              Ces données aident à protéger votre compte. Seul vous pouvez voir cette activité.
              Eneo ne partage jamais ces informations avec des tiers.
            </p>
          </div>
        </div>

      </div>
    </Layout>
  )
}
