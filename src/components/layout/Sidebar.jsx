/**
 * components/layout/Sidebar.jsx
 * Navigation style Google Account — sidebar gauche fixe
 */

import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  AppWindow,
  AlertTriangle,
  History,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
  { path: '/profile',   icon: User,            label: 'Informations personnelles' },
  { path: '/security',  icon: ShieldCheck,     label: 'Sécurité et connexion' },
  { path: '/apps',      icon: AppWindow,       label: 'Applications liées' },
  { path: '/activity',  icon: History,         label: 'Mon activité' },
]
const DANGER_ITEM = { path: '/danger', icon: AlertTriangle, label: 'Zone de danger' }

// ── Nav item ──────────────────────────────────────────────────────
function NavItem({ item, collapsed }) {
  const location = useLocation()
  const isActive = location.pathname === item.path
  const Icon = item.icon
  const isDanger = item.path === '/danger'

  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-full
        transition-all duration-150 cursor-pointer select-none text-sm
        ${collapsed ? 'justify-center' : ''}
        ${isDanger
          ? isActive
            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 font-medium'
            : 'text-[#5F6368] hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500'
          : isActive
            ? 'bg-[#F3E8FF] dark:bg-eneo-purple-900/50 text-[#7B2D8B] font-semibold'
            : 'text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] font-normal'
        }
      `}
    >
      <Icon className={`flex-shrink-0 w-[18px] h-[18px] ${
        isActive && !isDanger ? 'text-[#7B2D8B]' : isDanger ? 'text-red-400' : 'text-[#5F6368]'
      }`} />

      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}

      {/* Tooltip quand collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#3C4043] text-white text-xs font-medium rounded-lg
                        opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50
                        transition-opacity duration-150 shadow-lg">
          {item.label}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#3C4043]" />
        </div>
      )}
    </NavLink>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────
export default function Sidebar({ collapsed, onToggle }) {
  const { user, profile, logout } = useAuth()
  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.name || user?.preferred_username || 'Utilisateur'
  const email    = user?.email || ''
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside className={`
      h-full flex flex-col bg-white border-r border-[#E8EAED]
      transition-all duration-300 ease-in-out
      ${collapsed ? 'w-[72px]' : 'w-[256px]'}
    `}>

      {/* ── User chip (expanded only) ── */}
      {!collapsed ? (
        <div className="px-3 py-4 border-b border-[#E8EAED]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                   style={{ background: '#7B2D8B' }}>
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--color-text)] truncate leading-tight">{displayName}</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{email}</p>
            </div>
            {/* Toggle collapse */}
            <button
              onClick={onToggle}
              className="p-1 rounded-full text-[#9AA0A6] hover:bg-[#E8EAED] transition-colors flex-shrink-0"
              title="Réduire"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Avatar seul quand collapsed */
        <div className="flex flex-col items-center py-4 border-b border-[#E8EAED] gap-2">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={displayName} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                 style={{ background: '#7B2D8B' }}>
              {initials}
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded-full text-[#9AA0A6] hover:bg-[#F1F3F4] transition-colors"
            title="Développer"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}

        <div className="my-2 mx-3 border-t border-[#E8EAED]" />

        <NavItem item={DANGER_ITEM} collapsed={collapsed} />
      </nav>

      {/* ── Déconnexion ── */}
      <div className="px-2 py-3 border-t border-[#E8EAED]">
        <button
          onClick={logout}
          className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-full
                     text-[#5F6368] hover:bg-red-50 hover:text-red-600
                     transition-all duration-150 text-sm
                     ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Se déconnecter' : undefined}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Se déconnecter</span>}

          {collapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#3C4043] text-white text-xs font-medium rounded-lg
                            opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50
                            transition-opacity duration-150 shadow-lg">
              Se déconnecter
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
