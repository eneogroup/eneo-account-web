/**
 * hooks/useProfile.js
 * Hook pour gérer le profil utilisateur (lecture, modification, avatar, adresse).
 */

import { useState, useCallback } from 'react'
import { api } from '../api/client'
import { useAuth } from './useAuth'

export function useProfile() {
  const { profile, setProfile, loadProfile } = useAuth()
  const [isLoading, setIsLoading]   = useState(false)
  const [isSaving, setIsSaving]     = useState(false)
  const [error, setError]           = useState(null)

  // ── Mise à jour du profil ──────────────────────────────────────
  const updateProfile = useCallback(async (data) => {
    setIsSaving(true)
    setError(null)
    try {
      const { data: updated } = await api.updateProfile(data)
      setProfile((prev) => ({ ...prev, ...updated }))
      return { success: true, data: updated }
    } catch (err) {
      const message = err.message || 'Erreur lors de la mise à jour du profil'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsSaving(false)
    }
  }, [setProfile])

  // ── Upload avatar ──────────────────────────────────────────────
  const uploadAvatar = useCallback(async (file) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.uploadAvatar(file)
      setProfile((prev) => ({ ...prev, avatar_url: data.avatar_url }))
      return { success: true, data }
    } catch (err) {
      const message = err.message || 'Erreur lors de l\'upload de l\'avatar'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [setProfile])

  // ── Supprimer avatar ───────────────────────────────────────────
  const deleteAvatar = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await api.deleteAvatar()
      setProfile((prev) => ({ ...prev, avatar_url: null }))
      return { success: true }
    } catch (err) {
      const message = err.message || 'Erreur lors de la suppression de l\'avatar'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [setProfile])

  // ── Adresse ────────────────────────────────────────────────────
  const [address, setAddress]         = useState(null)
  const [addressLoading, setAddressLoading] = useState(false)

  const fetchAddress = useCallback(async () => {
    setAddressLoading(true)
    try {
      const { data } = await api.getAddress()
      setAddress(data)
      return data
    } catch {
      return null
    } finally {
      setAddressLoading(false)
    }
  }, [])

  const updateAddress = useCallback(async (data) => {
    setIsSaving(true)
    setError(null)
    try {
      const { data: updated } = await api.updateAddress(data)
      setAddress(updated)
      return { success: true, data: updated }
    } catch (err) {
      const message = err.message || 'Erreur lors de la mise à jour de l\'adresse'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsSaving(false)
    }
  }, [])

  // ── Historique ─────────────────────────────────────────────────
  const [history, setHistory]         = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const { data } = await api.getProfileHistory()
      setHistory(data?.results || data || [])
    } catch {
      // Silencieux
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  return {
    profile,
    isLoading,
    isSaving,
    error,
    // Profil
    updateProfile,
    reloadProfile: loadProfile,
    // Avatar
    uploadAvatar,
    deleteAvatar,
    // Adresse
    address,
    addressLoading,
    fetchAddress,
    updateAddress,
    // Historique
    history,
    historyLoading,
    fetchHistory,
  }
}
