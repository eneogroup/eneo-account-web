/**
 * components/ui/SessionCard.jsx
 * Carte de session : appareil, navigateur, localisation, IP, révocation.
 */

import React from 'react'
import {
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  MapPin,
  Clock,
  Trash2,
  Wifi,
} from 'lucide-react'
import { CurrentSessionBadge } from './Badge'

// ── Icône appareil selon le type ─────────────────────────────────
function DeviceIcon({ deviceType, className }) {
  const type = (deviceType || '').toLowerCase()
  if (type.includes('mobile') || type.includes('phone')) {
    return <Smartphone className={className} />
  }
  if (type.includes('tablet')) {
    return <Tablet className={className} />
  }
  return <Monitor className={className} />
}

// ── Formater la date relative ────────────────────────────────────
function formatRelativeDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const now  = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / 60_000)
  const hours   = Math.floor(diff / 3_600_000)
  const days    = Math.floor(diff / 86_400_000)

  if (minutes < 2)  return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours   < 24) return `Il y a ${hours}h`
  if (days    < 7)  return `Il y a ${days} jour${days > 1 ? 's' : ''}`

  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Info chip ────────────────────────────────────────────────────
function InfoChip({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
      <Icon className="w-3.5 h-3.5 flex-shrink-0 text-eneo-purple-300" />
      <span className="font-medium text-gray-600">{label}:</span>
      <span>{value}</span>
    </div>
  )
}

// ── SessionCard ──────────────────────────────────────────────────
export default function SessionCard({ session, onRevoke, isRevoking }) {
  const {
    id,
    device_type,
    device_name,
    os,
    browser,
    ip_address,
    city,
    country,
    last_activity,
    created_at,
    is_current,
  } = session

  const locationStr = [city, country].filter(Boolean).join(', ')

  return (
    <div
      className={`
        card p-4 flex items-start gap-4 transition-all duration-200
        ${is_current
          ? 'border-eneo-gold-200 bg-gradient-to-r from-eneo-gold-50/30 to-white'
          : 'hover:shadow-card-hover'
        }
      `}
    >
      {/* ── Icône appareil ── */}
      <div className={`
        w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
        ${is_current
          ? 'bg-eneo-gold-100 border border-eneo-gold-200'
          : 'bg-eneo-purple-50 border border-eneo-purple-100'
        }
      `}>
        <DeviceIcon
          deviceType={device_type}
          className={`w-5 h-5 ${is_current ? 'text-eneo-gold-600' : 'text-eneo-purple-400'}`}
        />
      </div>

      {/* ── Contenu ── */}
      <div className="flex-1 min-w-0">
        {/* Ligne 1 : nom appareil + badge courant */}
        <div className="flex items-center flex-wrap gap-2 mb-1.5">
          <h3 className="text-sm font-semibold text-gray-800 truncate">
            {device_name || browser || 'Appareil inconnu'}
          </h3>
          {is_current && <CurrentSessionBadge />}
        </div>

        {/* Ligne 2 : infos détaillées */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
          <InfoChip icon={Monitor}    label="Système"    value={os} />
          <InfoChip icon={Globe}      label="Navigateur" value={browser} />
          <InfoChip icon={Wifi}       label="IP"         value={ip_address} />
          <InfoChip icon={MapPin}     label="Lieu"       value={locationStr || null} />
          <InfoChip icon={Clock}      label="Dernière activité" value={formatRelativeDate(last_activity)} />
          <InfoChip icon={Clock}      label="Démarrée"   value={formatRelativeDate(created_at)} />
        </div>
      </div>

      {/* ── Bouton révoquer ── */}
      {!is_current && (
        <button
          onClick={() => onRevoke(id)}
          disabled={isRevoking}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                     text-xs font-semibold text-red-500 border border-red-100
                     hover:bg-red-50 hover:border-red-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-150"
          title="Révoquer cette session"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Révoquer</span>
        </button>
      )}
    </div>
  )
}
