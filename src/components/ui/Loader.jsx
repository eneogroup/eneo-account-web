/**
 * components/ui/Loader.jsx
 * Composants de chargement : spinner, dots, skeleton, page loader.
 */

import React from 'react'

// ── Spinner circulaire ───────────────────────────────────────────
export function Spinner({ size = 'md', color = 'purple', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' }
  const colors = {
    purple: 'border-eneo-purple-200 border-t-eneo-purple-500',
    gold:   'border-eneo-gold-200 border-t-eneo-gold-400',
    white:  'border-white/30 border-t-white',
    gray:   'border-gray-200 border-t-gray-500',
  }

  return (
    <div
      className={`rounded-full border-2 animate-spin ${sizes[size]} ${colors[color] || colors.purple} ${className}`}
      role="status"
      aria-label="Chargement…"
    />
  )
}

// ── Dots animés ──────────────────────────────────────────────────
export function LoadingDots({ color = 'purple' }) {
  const dotColor = color === 'white' ? 'bg-white' : 'bg-eneo-purple-400'
  return (
    <div className="flex gap-1.5 items-center" role="status" aria-label="Chargement…">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${dotColor} animate-pulse-soft`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

// ── Page full-screen loader ──────────────────────────────────────
export function PageLoader({ message = 'Chargement…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="avatar-ring">
        <div className="w-14 h-14 rounded-full bg-eneo-purple-500 flex items-center justify-center">
          <span className="text-xl font-display font-bold text-white">E</span>
        </div>
      </div>
      <LoadingDots />
      <p className="text-sm text-[var(--color-text-muted)] font-medium">{message}</p>
    </div>
  )
}

// ── Ligne skeleton ───────────────────────────────────────────────
export function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }) {
  return <div className={`skeleton ${width} ${height} rounded-lg ${className}`} />
}

// ── Skeleton de champ formulaire ─────────────────────────────────
export function SkeletonField() {
  return (
    <div className="space-y-1.5">
      <SkeletonLine width="w-24" height="h-3" />
      <SkeletonLine width="w-full" height="h-10" />
    </div>
  )
}

// ── Inline button loader ─────────────────────────────────────────
export function ButtonLoader({ label = 'Enregistrement…' }) {
  return (
    <div className="flex items-center gap-2">
      <Spinner size="sm" color="white" />
      <span>{label}</span>
    </div>
  )
}
