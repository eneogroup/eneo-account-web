/**
 * components/layout/Layout.jsx
 * Layout Google Account style : sidebar fixe + top header pour mobile
 * Inspiré de l'interface de Google Account 2024.
 */

import React, { useState, useEffect, useRef } from 'react'
import { Menu, X, Search, Grid3X3, Sun, Moon } from 'lucide-react'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { api } from '../../api/client'

// ── App Launcher Popover ──────────────────────────────────────────
function AppLauncher() {
  const [open, setOpen]     = useState(false)
  const [apps, setApps]     = useState([])
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (open && apps.length === 0) {
      setLoading(true)
      api.getApps().then(res => {
        const raw = res.data
        setApps(Array.isArray(raw) ? raw : Array.isArray(raw?.apps) ? raw.apps : [])
      }).catch(() => {}).finally(() => setLoading(false))
    }
  }, [open])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function AppIcon({ app }) {
    const initials = (app.display_name || app.name || 'A')
      .split(/[\s-_]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const colors = ['#7B2D8B', '#1A73E8', '#188038', '#E37400', '#D93025', '#6200EE']
    const color  = colors[(app.name || '').charCodeAt(0) % colors.length]

    return (
      <a
        href={app.url || '#'}
        target={app.url ? '_blank' : undefined}
        rel="noopener noreferrer"
        className="app-launcher-item"
        onClick={() => setOpen(false)}
      >
        {app.logo_url ? (
          <img src={app.logo_url} alt={app.display_name || app.name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
               style={{ background: color }}>
            {initials}
          </div>
        )}
        <span>{app.display_name || app.name}</span>
      </a>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-[#5F6368]
                   hover:bg-[#F1F3F4] transition-colors"
        title="Applications Eneo"
      >
        <Grid3X3 className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-[#E0E0E0] z-50 overflow-hidden animate-fade-in">
          <div className="px-4 pt-4 pb-2 border-b border-[#E0E0E0]">
            <p className="text-base font-semibold text-[#202124]">Applications Eneo</p>
          </div>
          <div className="p-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#7B2D8B] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : apps.length === 0 ? (
              <p className="text-xs text-[#5F6368] text-center py-6">Aucune application disponible</p>
            ) : (
              <div className="app-launcher-grid">
                {apps.map((app, i) => <AppIcon key={app.id || app.name || i} app={app} />)}
              </div>
            )}
          </div>
          <div className="border-t border-[#E0E0E0] p-2">
            <Link
              to="/apps"
              className="block text-center text-sm text-[#7B2D8B] font-medium py-2 rounded-lg hover:bg-[#F3E8FF] transition-colors"
              onClick={() => setOpen(false)}
            >
              Voir toutes les applications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Toggle Dark Mode ──────────────────────────────────────────────
function ThemeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={dark ? 'Mode clair' : 'Mode sombre'}
      className="w-10 h-10 rounded-full flex items-center justify-center text-[#5F6368] hover:bg-[#F1F3F4] dark:text-[#9AA0A6] dark:hover:bg-[#262638] transition-colors"
    >
      {dark
        ? <Sun  className="w-5 h-5 text-amber-400" />
        : <Moon className="w-5 h-5" />
      }
    </button>
  )
}

// ── Top Header (desktop) ──────────────────────────────────────────
function TopHeader({ sidebarWidth }) {
  const { profile, user } = useAuth()
  const displayName = profile?.first_name || user?.preferred_username || 'Compte'
  const initials    = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-[#E8EAED] hidden lg:grid items-center px-6"
            style={{ gridTemplateColumns: '1fr auto 1fr' }}>
      {/* Logo + Titre — gauche */}
      <div className="flex items-center gap-2.5">
        <img src="/LG_1.png" alt="Eneo" className="w-8 h-8 object-contain" />
        <div className="leading-none">
          <span className="text-[15px] font-semibold text-[var(--color-text-2)]">Eneo </span>
          <span className="text-[15px] font-normal text-[var(--color-text-muted)]">Compte</span>
        </div>
      </div>

      {/* Search bar — centre absolu */}
      <div className="w-[480px]">
        <div className="search-bar">
          <Search className="w-[18px] h-[18px] text-[#9AA0A6] flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher dans votre compte..."
            className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[#9AA0A6] outline-none"
          />
        </div>
      </div>

      {/* Actions — droite */}
      <div className="flex items-center gap-2 justify-end">
        <ThemeToggle />
        <AppLauncher />
        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-semibold cursor-pointer ring-2 ring-transparent hover:ring-[#DADCE0] transition-all"
             style={{ background: '#7B2D8B' }}>
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            : <span>{initials}</span>
          }
        </div>
      </div>
    </header>
  )
}

// ── Mobile Header ─────────────────────────────────────────────────
function MobileHeader({ onMenuOpen }) {
  const { profile, user } = useAuth()
  const displayName = profile?.first_name || user?.preferred_username || 'Compte'
  const initials    = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-[#E0E0E0] flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <button onClick={onMenuOpen} className="p-2 rounded-full text-[#5F6368] hover:bg-[#F1F3F4] transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/LG_1.png" alt="Eneo" className="w-7 h-7 object-contain" />
          <span className="font-display font-bold text-[#7B2D8B] text-sm">
            Eneo <span className="font-normal text-[var(--color-text)]">Compte</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {profile?.avatar_url
          ? <img src={profile.avatar_url} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
          : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                 style={{ background: 'linear-gradient(135deg, #7B2D8B, #FBAD1A)' }}>{initials}</div>
        }
      </div>
    </header>
  )
}

// ── Mobile Overlay ────────────────────────────────────────────────
function MobileOverlay({ open, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 h-full shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-[-48px] p-2 rounded-full bg-white shadow text-[#5F6368]">
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  )
}

// ── Layout principal ──────────────────────────────────────────────
export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarWidth = collapsed ? 72 : 256

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Mobile header */}
      <MobileHeader onMenuOpen={() => setMobileOpen(true)} />

      {/* Desktop top header — pleine largeur, au-dessus de la sidebar */}
      <TopHeader sidebarWidth={sidebarWidth} />

      {/* Desktop sidebar — positionnée sous le header (top: 64px) */}
      <div
        className="hidden lg:flex flex-col fixed left-0 z-30 transition-all duration-300"
        style={{ width: sidebarWidth, top: 64, height: 'calc(100vh - 64px)' }}
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      </div>

      {/* Mobile overlay */}
      <MobileOverlay open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </MobileOverlay>

      {/* Main content */}
      <main className="min-h-screen pt-14 lg:pt-16 transition-all duration-300"
            style={{ marginLeft: 0 }}>
        {/* Décalage sidebar sur desktop uniquement */}
        <div className="lg:pl-0 transition-all duration-300"
             style={{ paddingLeft: 0 }}>
          <div className="hidden lg:block" style={{ marginLeft: sidebarWidth }}>
            <div className="max-w-3xl mx-auto px-8 py-8">
              {children}
            </div>
          </div>
          <div className="lg:hidden px-4 py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
