/**
 * hooks/useToast.js
 * Système de notifications toast léger, sans dépendance externe.
 * Usage : const { toasts, toast } = useToast()
 *         toast.success('Profil mis à jour !')
 *         toast.error('Une erreur est survenue.')
 */

import { useState, useCallback } from 'react'

let _toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = ++_toastId
    setToasts((prev) => [...prev, { id, type, message }])

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (message, duration) => addToast({ type: 'success', message, duration }),
    error:   (message, duration) => addToast({ type: 'error',   message, duration }),
    info:    (message, duration) => addToast({ type: 'info',    message, duration }),
    warning: (message, duration) => addToast({ type: 'warning', message, duration }),
  }

  return { toasts, toast, removeToast }
}
