/**
 * pages/Dashboard.jsx
 * Tableau de bord — Style Google Compte épuré
 */
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, ShieldCheck, AppWindow, History,
  Clock, MapPin, Monitor, ChevronRight, CheckCircle,
  AlertTriangle, Search, Camera,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../api/client'
import Layout from '../components/layout/Layout'

// ── Bouton de raccourci rapide (chips Google) ────────────────────
function QuickChip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full border border-[#DADCE0] bg-white text-sm text-[#3C4043] font-medium
                 hover:bg-[#F1F3F4] hover:border-[#BDC1C6] transition-all duration-150 whitespace-nowrap"
    >
      {label}
    </button>
  )
}

// ── Section card ────────────────────────────────────────────────
function SectionCard({ icon: Icon, iconColor, title, desc, onClick }) {
  return (
    <div className="card-section cursor-pointer group" onClick={onClick}>
      <div className="card-row">
        <div className="flex items-center gap-4 flex-1">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${iconColor}18` }}
          >
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#202124]">{title}</p>
            {desc && <p className="text-xs text-[#5F6368] mt-0.5 truncate max-w-xs">{desc}</p>}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#BDC1C6] group-hover:text-[#5F6368] transition-colors" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [sessions, setSessions] = useState([])
  const [apps, setApps]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [checkup, setCheckup]   = useState(null)

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.name || user?.preferred_username || 'Utilisateur'
  const email    = user?.email || profile?.email || ''
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [sr, ar, cr] = await Promise.allSettled([
          api.getSessions(), api.getApps(), api.getSecurityCheckup(),
        ])
        if (sr.status === 'fulfilled') {
          const raw = sr.value.data
          setSessions(Array.isArray(raw) ? raw : Array.isArray(raw?.results) ? raw.results : [])
        }
        if (ar.status === 'fulfilled') {
          const raw = ar.value.data
          setApps(Array.isArray(raw) ? raw : Array.isArray(raw?.apps) ? raw.apps : [])
        }
        if (cr.status === 'fulfilled') setCheckup(cr.value.data)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const currentSession = sessions.find(s => s.is_current)

  return (
    <Layout>
      <div className="space-y-6 page-enter">

        {/* ── Profil Hero ── */}
        <div className="card overflow-hidden">

          {/* Bande colorée en haut — violet uni */}
          <div className="h-24 w-full" style={{ background: '#7B2D8B' }} />

          {/* Contenu centré */}
          <div className="flex flex-col items-center px-6 pb-8 -mt-12">

            {/* Avatar avec bouton caméra */}
            <button
              onClick={() => navigate('/profile')}
              className="relative focus:outline-none group mb-4"
            >
              <div
                className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
                    style={{ background: 'linear-gradient(135deg, #7B2D8B, #FBAD1A)' }}
                  >
                    {initials}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#F1F3F4] border-2 border-white
                              flex items-center justify-center shadow-sm group-hover:bg-[#E0E0E0] transition-colors">
                <Camera className="w-3.5 h-3.5 text-[#5F6368]" />
              </div>
            </button>

            {/* Nom + email */}
            <h1 className="text-2xl font-semibold text-[#202124]">{displayName}</h1>
            <p className="text-sm text-[#5F6368] mt-1">{email}</p>

            {/* Badges */}
            <div className="flex gap-2 mt-3 flex-wrap justify-center">
              <span className="badge-purple">Eneo Group SSO</span>
              <span className="badge-green flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Compte actif
              </span>
              {checkup && (
                <span className={`badge ${checkup.score === 100 ? 'badge-green' : checkup.score > 50 ? 'badge-gold' : 'badge-red'}`}>
                  Sécurité {checkup.score}%
                </span>
              )}
            </div>

            {/* Barre de recherche */}
            <div className="w-full max-w-lg mt-6 search-bar">
              <Search className="w-4 h-4 text-[#9AA0A6] flex-shrink-0" />
              <input
                type="text"
                placeholder="Rechercher dans votre compte Eneo..."
                className="flex-1 bg-transparent text-sm text-[#202124] placeholder:text-[#9AA0A6] outline-none"
              />
            </div>

            {/* Chips de raccourcis */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <QuickChip label="Mon mot de passe"    onClick={() => navigate('/security')} />
              <QuickChip label="Appareils connectés" onClick={() => navigate('/security')} />
              <QuickChip label="Applications liées"  onClick={() => navigate('/apps')} />
              <QuickChip label="Mon activité"         onClick={() => navigate('/activity')} />
            </div>
          </div>
        </div>

        {/* ── Bannière sécurité ── */}
        {checkup && checkup.score < 100 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">Améliorez la sécurité de votre compte</p>
              <p className="text-xs text-amber-600 mt-0.5">{checkup.issues?.[0] || 'Complétez votre profil de sécurité'}</p>
            </div>
            <button onClick={() => navigate('/security')} className="text-xs font-bold text-amber-700 hover:underline flex-shrink-0">
              Voir →
            </button>
          </div>
        )}

        {/* ── Gérer votre compte ── */}
        <div>
          <p className="text-xs font-semibold text-[#9AA0A6] uppercase tracking-widest px-1 mb-3">
            Gérer votre compte
          </p>
          <div className="space-y-2">
            <SectionCard
              icon={User}
              iconColor="#1A73E8"
              title="Informations personnelles"
              desc="Nom, photo de profil, e-mail, téléphone"
              onClick={() => navigate('/profile')}
            />
            <SectionCard
              icon={ShieldCheck}
              iconColor="#188038"
              title="Sécurité & sessions"
              desc={`${sessions.length} session(s) active(s) · Mot de passe`}
              onClick={() => navigate('/security')}
            />
            <SectionCard
              icon={AppWindow}
              iconColor="#7B2D8B"
              title="Applications liées"
              desc={`${apps.length} application(s) avec accès à votre compte`}
              onClick={() => navigate('/apps')}
            />
            <SectionCard
              icon={History}
              iconColor="#E37400"
              title="Activité récente"
              desc="Connexions, modifications et événements de sécurité"
              onClick={() => navigate('/activity')}
            />
          </div>
        </div>

        {/* ── Session courante ── */}
        {!loading && currentSession && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#202124]">Session en cours</p>
              <button onClick={() => navigate('/security')} className="text-xs text-[#7B2D8B] font-semibold hover:underline flex items-center gap-1">
                Tout voir <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F9FA]">
              <div className="w-10 h-10 rounded-full bg-[#E8F0FE] flex items-center justify-center flex-shrink-0">
                <Monitor className="w-5 h-5 text-[#1A73E8]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#202124] truncate">
                  {currentSession.browser || currentSession.device_name || 'Session active'}
                  {currentSession.os ? ` · ${currentSession.os}` : ''}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  {currentSession.city && (
                    <span className="flex items-center gap-1 text-xs text-[#5F6368]">
                      <MapPin className="w-3 h-3" />{currentSession.city}, {currentSession.country}
                    </span>
                  )}
                  {currentSession.last_activity && (
                    <span className="flex items-center gap-1 text-xs text-[#5F6368]">
                      <Clock className="w-3 h-3" />
                      {new Date(currentSession.last_activity).toLocaleString('fr-FR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              </div>
              <span className="badge-green text-[10px]">● Actif</span>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
