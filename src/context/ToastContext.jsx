/**
 * context/ToastContext.jsx
 * Contexte global pour les toasts — accessible depuis n'importe quelle page.
 */

import React, { createContext, useContext } from 'react'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/ui/ToastContainer'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const { toasts, toast, removeToast } = useToast()

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useGlobalToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useGlobalToast doit être utilisé dans un <ToastProvider>')
  }
  return context
}
