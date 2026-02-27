/**
 * components/layout/Layout.jsx
 * Shell principal de l'application :
 * - Sidebar fixe à gauche (desktop)
 * - Header mobile avec burger menu
 * - Zone de contenu principale
 */

import React, { useState, useEffect } from 'react'
import { Menu, X, Bell } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../../hooks/useAuth'

// ── Header mobile ────────────────────────────────────────────────
function MobileHeader({ onMenuOpen }) {
  const { profile, user } = useAuth()
  const displayName = profile?.first_name || user?.preferred_username || 'Compte'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16
                        bg-white border-b border-[#EDE9F4] shadow-sm
                        flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8">
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="36" height="36" rx="8" fill="#7B2D8B"/>
            <path d="M8 28 Q8 10 24 10 L24 16 Q14 16 14 28 Z" fill="#a855f7"/>
            <path d="M18 8 L28 8 L28 18 Z" fill="#FBAD1A"/>
          </svg>
        </div>
        <span className="font-display font-bold text-eneo-purple-700 text-base">
          eneo<span className="text-eneo-gold-400">.</span>account
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Avatar compact */}
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-eneo-gold-400"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-eneo flex items-center justify-center ring-2 ring-eneo-gold-400">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
        )}

        {/* Burger */}
        <button
          onClick={onMenuOpen}
          className="p-2 rounded-xl text-eneo-purple-500 hover:bg-eneo-purple-50 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}

// ── Overlay mobile ───────────────────────────────────────────────
function MobileOverlay({ open, onClose, children }) {
  // Bloquer le scroll quand ouvert
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sidebar mobile */}
      <div className="relative z-10 h-full animate-slide-in-left">
        <div className="absolute top-4 right-[-48px]">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white shadow-lg text-eneo-purple-500
                       hover:bg-eneo-purple-50 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Layout principal ─────────────────────────────────────────────
export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false)

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex">

      {/* ── Sidebar desktop (fixe) ── */}
      <div className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen z-30
                        transition-all duration-300
                        ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(v => !v)}
        />
      </div>

      {/* ── Sidebar mobile (overlay) ── */}
      <MobileOverlay open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Sidebar
          collapsed={false}
          onToggle={() => setMobileMenuOpen(false)}
        />
      </MobileOverlay>

      {/* ── Header mobile ── */}
      <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />

      {/* ── Contenu principal ── */}
      <main
        className={`
          flex-1 min-h-screen transition-all duration-300
          pt-16 lg:pt-0
          ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}
        `}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
