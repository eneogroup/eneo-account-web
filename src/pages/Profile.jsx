/**
 * pages/Profile.jsx
 * Informations personnelles : profil, avatar, adresse, historique.
 */

import React, { useEffect, useState } from 'react'
import { User, Lock, MapPin, History, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { useGlobalToast } from '../context/ToastContext'
import Layout from '../components/layout/Layout'
import Avatar from '../components/ui/Avatar'
import Card, { CardHeader } from '../components/ui/Card'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { SkeletonField, ButtonLoader } from '../components/ui/Loader'

// ── Champ en lecture seule (Keycloak) ────────────────────────────
function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="label flex items-center gap-1.5">
        {label}
        <span className="group relative inline-flex">
          <Lock className="w-3 h-3 text-eneo-purple-300 cursor-help" />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5
                           bg-gray-800 text-white text-[11px] rounded-lg whitespace-nowrap
                           opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-lg">
            Géré par Eneo SSO
          </span>
        </span>
      </label>
      <div className="input bg-gray-50 text-gray-400 cursor-not-allowed flex items-center gap-2">
        <span className="flex-1 truncate">{value || '—'}</span>
        <Lock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
      </div>
    </div>
  )
}

// ── Section Profil principal ─────────────────────────────────────
function ProfileSection({ profile, onSave, isSaving }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name:  '',
    phone:      '',
    gender:     '',
  })
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name:  profile.last_name  || '',
        phone:      profile.phone      || '',
        gender:     profile.gender     || '',
      })
    }
  }, [profile])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setDirty(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await onSave(form)
    if (result.success) setDirty(false)
  }

  return (
    <Card>
      <CardHeader title="Informations personnelles" subtitle="Modifiez vos données de profil" icon={User} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Prénom</label>
            <input
              className="input"
              value={form.first_name}
              onChange={e => handleChange('first_name', e.target.value)}
              placeholder="Votre prénom"
            />
          </div>
          <div>
            <label className="label">Nom</label>
            <input
              className="input"
              value={form.last_name}
              onChange={e => handleChange('last_name', e.target.value)}
              placeholder="Votre nom de famille"
            />
          </div>
        </div>

        <div>
          <label className="label">Téléphone</label>
          <input
            className="input"
            type="tel"
            value={form.phone}
            onChange={e => handleChange('phone', e.target.value)}
            placeholder="+242 XX XXX XXXX"
          />
        </div>

        <div>
          <label className="label">Genre</label>
          <select
            className="input"
            value={form.gender}
            onChange={e => handleChange('gender', e.target.value)}
          >
            <option value="">Non renseigné</option>
            <option value="male">Homme</option>
            <option value="female">Femme</option>
            <option value="other">Autre</option>
            <option value="prefer_not_to_say">Préfère ne pas dire</option>
          </select>
        </div>

        {/* Champs Keycloak en lecture seule */}
        <div className="divider" />
        <p className="text-xs text-[var(--color-text-muted)] font-medium mb-3">
          Champs synchronisés depuis Eneo SSO
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReadOnlyField label="Email"            value={profile?.email} />
          <ReadOnlyField label="Nom d'utilisateur" value={profile?.username} />
        </div>

        {dirty && (
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? <ButtonLoader label="Enregistrement…" /> : <><Save className="w-4 h-4" />Enregistrer</>}
            </button>
          </div>
        )}
      </form>
    </Card>
  )
}

// ── Section Avatar ───────────────────────────────────────────────
function AvatarSection({ profile, displayName, onUpload, onDelete, isLoading }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <Card>
      <CardHeader title="Photo de profil" subtitle="Personnalisez votre avatar" />
      <div className="flex items-center gap-6">
        <Avatar
          src={profile?.avatar_url}
          name={displayName}
          size="2xl"
          ring
          editable
          onUpload={onUpload}
          onDelete={() => setConfirmDelete(true)}
        />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{displayName}</p>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Formats acceptés : JPG, PNG, WebP, GIF<br />
            Taille maximale recommandée : 2 Mo
          </p>
          {profile?.avatar_url && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Supprimer la photo
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => { await onDelete(); setConfirmDelete(false) }}
        title="Supprimer la photo de profil"
        message="Votre photo de profil sera supprimée et remplacée par vos initiales. Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        danger
        isLoading={isLoading}
      />
    </Card>
  )
}

// ── Section Adresse ──────────────────────────────────────────────
// Le backend retourne les clés en français : pays, ville, quartier, rue, code_postal
function AddressSection({ address, onSave, isSaving, loading }) {
  const [form, setForm] = useState({ pays: '', ville: '', quartier: '', rue: '', code_postal: '' })
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (address) {
      // Accepter les deux formats : français (backend) et anglais (legacy)
      setForm({
        pays:         address.pays        || address.country     || '',
        ville:        address.ville       || address.city        || '',
        quartier:     address.quartier    || address.district    || '',
        rue:          address.rue         || address.street      || '',
        code_postal:  address.code_postal || address.postal_code || '',
      })
    }
  }, [address])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setDirty(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await onSave(form)
    if (result.success) setDirty(false)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="Adresse" icon={MapPin} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonField key={i} />)}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title="Adresse" subtitle="Votre adresse de résidence" icon={MapPin} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Pays</label>
            <input className="input" value={form.pays} onChange={e => handleChange('pays', e.target.value)} placeholder="Congo" />
          </div>
          <div>
            <label className="label">Ville</label>
            <input className="input" value={form.ville} onChange={e => handleChange('ville', e.target.value)} placeholder="Pointe-Noire" />
          </div>
          <div>
            <label className="label">Quartier</label>
            <input className="input" value={form.quartier} onChange={e => handleChange('quartier', e.target.value)} placeholder="Nom du quartier" />
          </div>
          <div>
            <label className="label">Code postal</label>
            <input className="input" value={form.code_postal} onChange={e => handleChange('code_postal', e.target.value)} placeholder="Code postal" />
          </div>
        </div>
        <div>
          <label className="label">Rue / Adresse complète</label>
          <input className="input" value={form.rue} onChange={e => handleChange('rue', e.target.value)} placeholder="N° et nom de rue" />
        </div>
        {dirty && (
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? <ButtonLoader label="Enregistrement…" /> : <><Save className="w-4 h-4" />Enregistrer</>}
            </button>
          </div>
        )}
      </form>
    </Card>
  )
}

// ── Section Historique ───────────────────────────────────────────
function HistorySection({ history, loading, loaded, onLoad }) {
  const [open, setOpen] = useState(false)

  const handleToggle = () => {
    setOpen(v => !v)
    if (!loaded) onLoad()
  }

  const FIELD_LABELS = {
    first_name: 'Prénom', last_name: 'Nom', phone: 'Téléphone',
    gender: 'Genre', avatar_url: 'Photo de profil',
  }

  return (
    <Card>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-eneo-purple-50 border border-eneo-purple-100 flex items-center justify-center">
            <History className="w-5 h-5 text-eneo-purple-500" />
          </div>
          <div>
            <h2 className="section-title mb-0">Historique des modifications</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Journal des changements récents</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-eneo-purple-300" /> : <ChevronDown className="w-5 h-5 text-eneo-purple-300" />}
      </button>

      {open && (
        <div className="mt-5 space-y-3">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <SkeletonField key={i} />)}
            </div>
          )}
          {!loading && history.length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
              Aucune modification enregistrée.
            </p>
          )}
          {!loading && history.map((entry, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-eneo-purple-300 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-eneo-purple-600 font-semibold">
                    {FIELD_LABELS[entry.field] || entry.field}
                  </span>
                  {' '}modifié
                </p>
                {entry.old_value && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    Ancienne valeur : {entry.old_value}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {entry.changed_at
                  ? new Date(entry.changed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                  : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ── Page Profile ─────────────────────────────────────────────────
export default function Profile() {
  const { toast } = useGlobalToast()
  const {
    profile, isSaving,
    updateProfile,
    uploadAvatar, deleteAvatar, isLoading: avatarLoading,
    address, addressLoading, fetchAddress, updateAddress,
    history, historyLoading, fetchHistory,
  } = useProfile()

  const [historyLoaded, setHistoryLoaded] = useState(false)

  useEffect(() => {
    fetchAddress()
  }, [])

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur'
    : 'Utilisateur'

  const handleSaveProfile = async (data) => {
    const result = await updateProfile(data)
    if (result.success) toast.success('Profil mis à jour avec succès !')
    else toast.error(result.error || 'Erreur lors de la mise à jour')
    return result
  }

  const handleUploadAvatar = async (file) => {
    const result = await uploadAvatar(file)
    if (result.success) toast.success('Photo de profil mise à jour !')
    else toast.error(result.error || 'Erreur lors de l\'upload')
  }

  const handleDeleteAvatar = async () => {
    const result = await deleteAvatar()
    if (result.success) toast.success('Photo de profil supprimée.')
    else toast.error(result.error || 'Erreur lors de la suppression')
  }

  const handleSaveAddress = async (data) => {
    const result = await updateAddress(data)
    if (result.success) toast.success('Adresse mise à jour !')
    else toast.error(result.error || 'Erreur lors de la mise à jour')
    return result
  }

  const handleLoadHistory = async () => {
    await fetchHistory()
    setHistoryLoaded(true)
  }

  return (
    <Layout>
      <div className="space-y-6 page-enter">
        <div>
          <h1 className="section-title text-2xl">Informations personnelles</h1>
          <p className="section-subtitle">Gérez votre profil et vos coordonnées</p>
        </div>

        <AvatarSection
          profile={profile}
          displayName={displayName}
          onUpload={handleUploadAvatar}
          onDelete={handleDeleteAvatar}
          isLoading={avatarLoading}
        />

        <ProfileSection
          profile={profile}
          onSave={handleSaveProfile}
          isSaving={isSaving}
        />

        <AddressSection
          address={address}
          onSave={handleSaveAddress}
          isSaving={isSaving}
          loading={addressLoading}
        />

        <HistorySection
          history={history}
          loading={historyLoading}
          loaded={historyLoaded}
          onLoad={handleLoadHistory}
        />
      </div>
    </Layout>
  )
}