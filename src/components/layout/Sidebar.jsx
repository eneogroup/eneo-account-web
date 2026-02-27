/**
 * components/layout/Sidebar.jsx
 * Sidebar de navigation principale avec branding Eneo Group.
 */

import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  AppWindow,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const NAV_ITEMS = [
  {
    path:  '/dashboard',
    icon:  LayoutDashboard,
    label: 'Tableau de bord',
    description: 'Vue d\'ensemble',
  },
  {
    path:  '/profile',
    icon:  User,
    label: 'Informations personnelles',
    description: 'Profil & avatar',
  },
  {
    path:  '/security',
    icon:  ShieldCheck,
    label: 'Sécurité & sessions',
    description: 'Accès & appareils',
  },
  {
    path:  '/apps',
    icon:  AppWindow,
    label: 'Applications liées',
    description: 'Accès & rôles',
  },
]

const DANGER_ITEM = {
  path:  '/danger',
  icon:  AlertTriangle,
  label: 'Zone de danger',
  description: 'Suppression du compte',
}

// ── Logo Eneo SVG ────────────────────────────────────────────────
function EneoLogo({ collapsed }) {
  return (
    <div className={`flex items-center gap-3 transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
      {/* Icône SVG fidèle au logo */}
      <div className="flex-shrink-0 w-9 h-9">
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect width="36" height="36" rx="8" fill="#7B2D8B"/>
          {/* Arc violet */}
          <path d="M8 28 Q8 10 24 10 L24 16 Q14 16 14 28 Z" fill="#a855f7"/>
          {/* Triangle doré */}
          <path d="M18 8 L28 8 L28 18 Z" fill="#FBAD1A"/>
        </svg>
      </div>

      {/* Texte logo */}
      {!collapsed && (
        <div className="overflow-hidden">
          <p className="font-display font-bold text-eneo-purple-700 text-lg leading-none tracking-tight">
            eneo
            <span className="text-eneo-gold-400">.</span>
          </p>
          <p className="text-[10px] font-semibold text-eneo-purple-400 uppercase tracking-widest leading-none mt-0.5">
            account
          </p>
        </div>
      )}
    </div>
  )
}

// ── Avatar utilisateur compact ───────────────────────────────────
function UserChip({ user, profile, collapsed }) {
  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.name || user?.preferred_username || 'Utilisateur'

  const email = user?.email || ''
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl bg-eneo-purple-50 border border-eneo-purple-100 ${collapsed ? 'justify-center' : ''}`}>
      {/* Avatar */}
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={displayName}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-eneo-gold-400 flex-shrink-0"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-eneo flex items-center justify-center flex-shrink-0 ring-2 ring-eneo-gold-400">
          <span className="text-xs font-bold text-white">{initials}</span>
        </div>
      )}

      {!collapsed && (
        <div className="overflow-hidden flex-1 min-w-0">
          <p className="text-sm font-semibold text-eneo-purple-800 truncate leading-tight">
            {displayName}
          </p>
          <p className="text-xs text-eneo-purple-400 truncate leading-tight mt-0.5">
            {email}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Item de navigation ───────────────────────────────────────────
function NavItem({ item, collapsed }) {
  const location = useLocation()
  const isActive = location.pathname === item.path
  const Icon = item.icon
  const isDanger = item.path === '/danger'

  return (
    <NavLink
      to={item.path}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-200 cursor-pointer select-none
        ${collapsed ? 'justify-center' : ''}
        ${isDanger
          ? isActive
            ? 'bg-red-50 text-red-600'
            : 'text-red-400 hover:bg-red-50 hover:text-red-600'
          : isActive
            ? 'bg-eneo-purple-500 text-white shadow-md shadow-eneo-purple-200'
            : 'text-eneo-purple-500 hover:bg-eneo-purple-50 hover:text-eneo-purple-700'
        }
      `}
      title={collapsed ? item.label : undefined}
    >
      {/* Barre active à gauche */}
      {isActive && !collapsed && !isDanger && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-eneo-gold-400 rounded-r-full" />
      )}

      <Icon className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
        collapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'
      }`} />

      {!collapsed && (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">{item.label}</p>
            {!isActive && (
              <p className={`text-[11px] leading-tight truncate mt-0.5 ${
                isDanger ? 'text-red-300' : 'text-eneo-purple-300'
              }`}>
                {item.description}
              </p>
            )}
          </div>
          {isActive && (
            <ChevronRight className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
          )}
        </>
      )}

      {/* Tooltip en mode collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-eneo-purple-800 text-white text-xs font-medium rounded-lg
                        opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50
                        transition-opacity duration-150 shadow-lg">
          {item.label}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-eneo-purple-800" />
        </div>
      )}
    </NavLink>
  )
}

// ── Sidebar principale ───────────────────────────────────────────
export default function Sidebar({ collapsed, onToggle }) {
  const { user, profile, logout } = useAuth()

  return (
    <aside
      className={`
        h-full flex flex-col bg-white border-r border-[#EDE9F4]
        shadow-sidebar transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* ── En-tête ── */}
      <div className={`flex items-center p-4 border-b border-[#EDE9F4] ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <EneoLogo collapsed={collapsed} />
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg text-eneo-purple-400 hover:bg-eneo-purple-50 hover:text-eneo-purple-600
                      transition-colors duration-150 ${collapsed ? 'hidden' : 'flex'}`}
          aria-label="Réduire la sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* ── Profil utilisateur ── */}
      <div className="p-3 border-b border-[#EDE9F4]">
        <UserChip user={user} profile={profile} collapsed={collapsed} />
      </div>

      {/* ── Navigation principale ── */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-bold text-eneo-purple-300 uppercase tracking-widest">
            Navigation
          </p>
        )}

        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}

        <div className={`border-t border-[#EDE9F4] ${collapsed ? 'my-2' : 'my-3'}`} />

        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-bold text-eneo-purple-300 uppercase tracking-widest">
            Compte
          </p>
        )}

        <NavItem item={DANGER_ITEM} collapsed={collapsed} />
      </nav>

      {/* ── Footer : bouton déconnexion + toggle ── */}
      <div className="p-3 border-t border-[#EDE9F4] space-y-2">
        <button
          onClick={logout}
          className={`
            group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-eneo-purple-400 hover:bg-red-50 hover:text-red-500
            transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Se déconnecter' : undefined}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
          {!collapsed && (
            <span className="text-sm font-semibold">Se déconnecter</span>
          )}
          {collapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg
                            opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50
                            transition-opacity duration-150 shadow-lg">
              Se déconnecter
            </div>
          )}
        </button>

        {/* Bouton expand en mode collapsed */}
        {collapsed && (
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 rounded-xl
                       text-eneo-purple-300 hover:bg-eneo-purple-50 hover:text-eneo-purple-500
                       transition-colors duration-150"
            aria-label="Agrandir la sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Version */}
        {!collapsed && (
          <p className="text-center text-[10px] text-eneo-purple-200 font-mono pt-1">
            eneo-account v0.1.0
          </p>
        )}
      </div>
    </aside>
  )
}
