/**
 * components/ui/Badge.jsx
 * Badge polyvalent avec couleurs et tailles configurables.
 */

import React from 'react'

const VARIANTS = {
  purple:  'bg-eneo-purple-100 text-eneo-purple-700 border-eneo-purple-200',
  gold:    'bg-eneo-gold-100 text-eneo-gold-700 border-eneo-gold-200',
  green:   'bg-green-100 text-green-700 border-green-200',
  red:     'bg-red-100 text-red-700 border-red-200',
  blue:    'bg-blue-100 text-blue-700 border-blue-200',
  gray:    'bg-gray-100 text-gray-600 border-gray-200',
  orange:  'bg-orange-100 text-orange-700 border-orange-200',
  teal:    'bg-teal-100 text-teal-700 border-teal-200',
}

const SIZES = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-1',
  sm: 'px-2.5 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
}

export default function Badge({
  children,
  variant = 'purple',
  size = 'sm',
  icon: Icon,
  dot,
  className = '',
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.gray
  const sizeClass    = SIZES[size] || SIZES.sm

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full border
        ${variantClass} ${sizeClass} ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'green' ? 'bg-green-500' :
          variant === 'red'   ? 'bg-red-500'   :
          variant === 'gold'  ? 'bg-eneo-gold-400' :
          'bg-current'
        }`} />
      )}
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      {children}
    </span>
  )
}

// ── Badges sémantiques prédéfinis ────────────────────────────────
export function RoleBadge({ role }) {
  // Couleur selon le préfixe du rôle
  let variant = 'purple'
  const r = role.toLowerCase()
  if (r.includes('admin'))   variant = 'red'
  else if (r.includes('manager') || r.includes('lead')) variant = 'gold'
  else if (r.includes('view') || r.includes('read'))    variant = 'gray'
  else if (r.includes('edit') || r.includes('write'))   variant = 'blue'
  else if (r.includes('realm'))  variant = 'teal'

  return <Badge variant={variant} size="xs">{role}</Badge>
}

export function StatusBadge({ active }) {
  return (
    <Badge variant={active ? 'green' : 'gray'} dot>
      {active ? 'Actif' : 'Inactif'}
    </Badge>
  )
}

export function CurrentSessionBadge() {
  return (
    <Badge variant="gold" dot size="xs">
      Session courante
    </Badge>
  )
}
