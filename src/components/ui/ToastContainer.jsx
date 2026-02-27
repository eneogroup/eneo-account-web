/**
 * components/ui/ToastContainer.jsx
 * Affiche les toasts en bas à droite de l'écran.
 */

import React from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    border: 'border-l-green-500',
    iconColor: 'text-green-500',
    bg: 'bg-white',
  },
  error: {
    icon: XCircle,
    border: 'border-l-red-500',
    iconColor: 'text-red-500',
    bg: 'bg-white',
  },
  info: {
    icon: Info,
    border: 'border-l-eneo-purple-500',
    iconColor: 'text-eneo-purple-500',
    bg: 'bg-white',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-l-eneo-gold-400',
    iconColor: 'text-eneo-gold-500',
    bg: 'bg-white',
  },
}

function Toast({ toast, onRemove }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info
  const Icon = config.icon

  return (
    <div
      className={`
        flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-xl
        border border-gray-100 border-l-4 ${config.border} ${config.bg}
        animate-slide-in-up min-w-[280px] max-w-[400px]
      `}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
      <p className="text-sm text-gray-700 font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}
