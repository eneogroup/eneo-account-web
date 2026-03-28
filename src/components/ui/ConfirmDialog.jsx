/**
 * components/ui/ConfirmDialog.jsx
 * Modale de confirmation pour les actions destructives.
 */

import React, { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Spinner } from './Loader'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmer l\'action',
  message,
  confirmLabel = 'Confirmer',
  cancelLabel  = 'Annuler',
  danger = false,
  isLoading = false,
}) {
  // Fermer avec Échap
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Bloquer le scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 bg-white dark:bg-[#1e1e30] rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-eneo-purple-50 dark:bg-eneo-purple-900/30'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-eneo-purple-400'}`} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 font-display">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {message && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{message}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" color="white" />
                <span>En cours…</span>
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
