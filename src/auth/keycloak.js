/**
 * keycloak.js
 * Gestion complète du flow Authorization Code + PKCE avec Keycloak.
 * Les tokens sont stockés en mémoire uniquement (jamais en localStorage).
 */

// ── Configuration ────────────────────────────────────────────────
const KC_URL       = import.meta.env.VITE_KEYCLOAK_URL      || 'https://sso.eneogroup.com'
const KC_REALM     = import.meta.env.VITE_KEYCLOAK_REALM    || 'eneogroup-si'
const KC_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'zury-web'
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI       || 'http://localhost:5173/callback'

const AUTH_ENDPOINT  = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/auth`
const TOKEN_ENDPOINT = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`
const LOGOUT_ENDPOINT = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/logout`
const USERINFO_ENDPOINT = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/userinfo`

// ── Token store en mémoire ───────────────────────────────────────
let _tokenStore = {
  accessToken:  null,
  refreshToken: null,
  idToken:      null,
  expiresAt:    null,   // timestamp ms
}

let _refreshTimer = null

// ── Helpers PKCE ─────────────────────────────────────────────────

/** Génère un string aléatoire sécurisé (code_verifier) */
function generateCodeVerifier() {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  return base64UrlEncode(array)
}

/** SHA-256 puis base64url → code_challenge */
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(digest))
}

/** Encode en base64url (sans padding) */
function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/** Génère un state aléatoire (protection CSRF) */
function generateState() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return base64UrlEncode(array)
}

// ── Décodage JWT (sans vérification de signature) ────────────────
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

// ── Redirection vers Keycloak ────────────────────────────────────
export async function redirectToLogin() {
  const verifier  = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  const state     = generateState()

  // Persister temporairement en sessionStorage pour survivre à la redirection
  sessionStorage.setItem('pkce_verifier', verifier)
  sessionStorage.setItem('pkce_state',    state)

  const params = new URLSearchParams({
    client_id:             KC_CLIENT_ID,
    redirect_uri:          REDIRECT_URI,
    response_type:         'code',
    scope:                 'openid profile email',
    code_challenge:        challenge,
    code_challenge_method: 'S256',
    state,
  })

  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`
}

// ── Échange code → tokens (page /callback) ───────────────────────
export async function exchangeCodeForTokens(code, returnedState) {
  const verifier      = sessionStorage.getItem('pkce_verifier')
  const expectedState = sessionStorage.getItem('pkce_state')

  // Nettoyage immédiat
  sessionStorage.removeItem('pkce_verifier')
  sessionStorage.removeItem('pkce_state')

  if (!verifier) {
    throw new Error('Code verifier manquant — session expirée ou attaque replay.')
  }
  if (returnedState !== expectedState) {
    throw new Error('State invalide — possible attaque CSRF.')
  }

  const body = new URLSearchParams({
    grant_type:    'authorization_code',
    client_id:     KC_CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    code,
    code_verifier: verifier,
  })

  const response = await fetch(TOKEN_ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error_description || 'Échec de l\'échange de token')
  }

  const tokens = await response.json()
  storeTokens(tokens)
  return tokens
}

// ── Stocker les tokens en mémoire ────────────────────────────────
function storeTokens(tokens) {
  const decoded = decodeJwt(tokens.access_token)
  const expiresAt = decoded?.exp
    ? decoded.exp * 1000
    : Date.now() + (tokens.expires_in || 300) * 1000

  _tokenStore = {
    accessToken:  tokens.access_token,
    refreshToken: tokens.refresh_token || null,
    idToken:      tokens.id_token || null,
    expiresAt,
  }

  scheduleTokenRefresh(expiresAt)
}

// ── Refresh automatique ──────────────────────────────────────────
function scheduleTokenRefresh(expiresAt) {
  if (_refreshTimer) clearTimeout(_refreshTimer)

  // Rafraîchir 60s avant expiration
  const delay = expiresAt - Date.now() - 60_000
  if (delay <= 0) {
    refreshToken()
    return
  }

  _refreshTimer = setTimeout(() => {
    refreshToken()
  }, delay)
}

export async function refreshToken() {
  if (!_tokenStore.refreshToken) {
    // Pas de refresh token → forcer reconnexion
    clearTokens()
    return null
  }

  try {
    const body = new URLSearchParams({
      grant_type:    'refresh_token',
      client_id:     KC_CLIENT_ID,
      refresh_token: _tokenStore.refreshToken,
    })

    const response = await fetch(TOKEN_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    })

    if (!response.ok) {
      clearTokens()
      return null
    }

    const tokens = await response.json()
    storeTokens(tokens)
    return tokens.access_token
  } catch {
    clearTokens()
    return null
  }
}

// ── Getters ──────────────────────────────────────────────────────
export function getAccessToken() {
  return _tokenStore.accessToken
}

export function getIdToken() {
  return _tokenStore.idToken
}

export function isAuthenticated() {
  return !!(
    _tokenStore.accessToken &&
    _tokenStore.expiresAt &&
    Date.now() < _tokenStore.expiresAt
  )
}

export function isTokenExpired() {
  if (!_tokenStore.expiresAt) return true
  return Date.now() >= _tokenStore.expiresAt
}

export function getUserInfo() {
  if (!_tokenStore.accessToken) return null
  return decodeJwt(_tokenStore.accessToken)
}

// ── Logout ───────────────────────────────────────────────────────
export function clearTokens() {
  if (_refreshTimer) clearTimeout(_refreshTimer)
  _tokenStore = {
    accessToken:  null,
    refreshToken: null,
    idToken:      null,
    expiresAt:    null,
  }
}

export async function logout() {
  const idToken = _tokenStore.idToken
  clearTokens()

  const params = new URLSearchParams({
    client_id:            KC_CLIENT_ID,
    post_logout_redirect_uri: window.location.origin,
  })

  if (idToken) {
    params.set('id_token_hint', idToken)
  }

  window.location.href = `${LOGOUT_ENDPOINT}?${params.toString()}`
}

// ── UserInfo depuis Keycloak (optionnel) ──────────────────────────
export async function fetchUserInfoFromKeycloak() {
  const token = getAccessToken()
  if (!token) throw new Error('Non authentifié')

  const response = await fetch(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) throw new Error('Impossible de récupérer les infos utilisateur')
  return response.json()
}
