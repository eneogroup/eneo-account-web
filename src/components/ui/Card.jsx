/**
 * components/ui/Card.jsx
 * Composant carte polyvalent avec variantes.
 */

import React from 'react'

// ── Card de base ─────────────────────────────────────────────────
export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
}) {
  const paddingClass = {
    none: '',
    sm:   'p-4',
    md:   'p-6',
    lg:   'p-8',
  }[padding] || 'p-6'

  return (
    <div
      className={`
        card ${paddingClass}
        ${hover ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ── Card avec header ─────────────────────────────────────────────
export function CardHeader({ title, subtitle, icon: Icon, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-eneo-purple-50 border border-eneo-purple-100
                          flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-eneo-purple-500" />
          </div>
        )}
        <div>
          <h2 className="section-title mb-0">{title}</h2>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  )
}

// ── Card statistique (pour le dashboard) ─────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'purple', trend, onClick }) {
  const colors = {
    purple: {
      bg:   'bg-eneo-purple-50',
      border: 'border-eneo-purple-100',
      icon: 'text-eneo-purple-500',
      text: 'text-eneo-purple-700',
    },
    gold: {
      bg:   'bg-eneo-gold-50',
      border: 'border-eneo-gold-100',
      icon: 'text-eneo-gold-500',
      text: 'text-eneo-gold-700',
    },
    green: {
      bg:   'bg-green-50',
      border: 'border-green-100',
      icon: 'text-green-500',
      text: 'text-green-700',
    },
    red: {
      bg:   'bg-red-50',
      border: 'border-red-100',
      icon: 'text-red-500',
      text: 'text-red-700',
    },
  }

  const c = colors[color] || colors.purple

  return (
    <div
      className={`card p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200' : ''}`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide truncate">
          {label}
        </p>
        <p className={`text-2xl font-bold font-display ${c.text} leading-tight`}>
          {value}
        </p>
        {trend && (
          <p className="text-xs text-[var(--color-text-light)] mt-0.5">{trend}</p>
        )}
      </div>
    </div>
  )
}

// ── Card avec gradient Eneo ───────────────────────────────────────
export function GradientCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl p-6 bg-gradient-eneo text-white relative overflow-hidden ${className}`}
    >
      {/* Décoration */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-eneo-gold-400/10 translate-y-1/2 -translate-x-1/2" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ── Card squelette (chargement) ───────────────────────────────────
export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`card p-6 space-y-3 ${className}`}>
      <div className="skeleton h-5 w-2/5 rounded-lg" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 rounded-lg ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  )
}
