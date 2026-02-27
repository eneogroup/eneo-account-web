import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute    from './components/auth/ProtectedRoute'
import Callback          from './pages/Callback'
import Dashboard         from './pages/Dashboard'
import Profile           from './pages/Profile'
import Security          from './pages/Security'
import Apps              from './pages/Apps'
import DangerZone        from './pages/DangerZone'

// ── Page 404 ─────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] gap-4">
      <div className="avatar-ring inline-block">
        <div className="w-16 h-16 rounded-full bg-eneo-purple-500 flex items-center justify-center">
          <span className="text-2xl font-display font-bold text-white">E</span>
        </div>
      </div>
      <h1 className="text-4xl font-display font-bold text-gradient">404</h1>
      <p className="text-[var(--color-text-muted)]">Page introuvable</p>
      <a href="/dashboard" className="btn-primary mt-2">Retour au tableau de bord</a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Callback SSO — public */}
            <Route path="/callback" element={<Callback />} />

            {/* Routes protégées */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/security"  element={<ProtectedRoute><Security /></ProtectedRoute>} />
            <Route path="/apps"      element={<ProtectedRoute><Apps /></ProtectedRoute>} />
            <Route path="/danger"    element={<ProtectedRoute><DangerZone /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}