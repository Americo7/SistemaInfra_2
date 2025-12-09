import Keycloak from 'keycloak-js'
import { createAuthentication } from '@redwoodjs/auth'

/* ──────────────────────────────────────────────────────────
   VARIABLES DE ESTADO GLOBAL
────────────────────────────────────────────────────────── */
let kc = null
let kcInitialized = false
let kcLoading = true // ← Controla si el auth está listo

/* ──────────────────────────────────────────────────────────
   VALIDACIÓN DE VARIABLES DE ENTORNO
────────────────────────────────────────────────────────── */
const ensureEnv = () => {
  if (!process.env.KEYCLOAK_URL) throw new Error('Missing KEYCLOAK_URL')
  if (!process.env.KEYCLOAK_REALM) throw new Error('Missing KEYCLOAK_REALM')
  if (!process.env.KEYCLOAK_CLIENT_ID) throw new Error('Missing KEYCLOAK_CLIENT_ID')
}

/* ──────────────────────────────────────────────────────────
   OBTENER INSTANCIA DE KEYCLOAK
────────────────────────────────────────────────────────── */
const getClient = () => {
  ensureEnv()

  if (!kc) {
    kc = new Keycloak({
      url: process.env.KEYCLOAK_URL,
      realm: process.env.KEYCLOAK_REALM,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
    })
  }

  return kc
}

/* ──────────────────────────────────────────────────────────
   INICIALIZACIÓN SEGURA (safeInit)
────────────────────────────────────────────────────────── */
const safeInit = async (options) => {
  const keycloak = getClient()

  // 1. Navegadores sin WebCrypto → Keycloak falla
  if (typeof window !== 'undefined' && !window.crypto) {
    console.warn("⚠️ Web Crypto API no disponible. Keycloak no podrá iniciar sesión.")
    kcInitialized = true
    kcLoading = false
    return null
  }

  // 2. Evitar doble inicialización
  if (kcInitialized) {
    kcLoading = false
    return keycloak
  }

  kcInitialized = true
  try {
    await keycloak.init(options)
  } catch (e) {
    console.warn('Keycloak init failed. Continuando como no autenticado.', e?.message || e)
  }

  kcLoading = false
  return keycloak
}

/* ──────────────────────────────────────────────────────────
   CLIENTE AUTH → API QUE REDWOOD UTILIZA
────────────────────────────────────────────────────────── */
const client = {
  login: async () => {
    const keycloak = getClient()

    if (!kcInitialized) {
      await safeInit({
        onLoad: 'check-sso',
        checkLoginIframe: false,
      })
    }

    return keycloak.login({
      redirectUri: window.location.origin,
    })
  },

  signup: async () => {
    const keycloak = getClient()

    if (!kcInitialized) {
      await safeInit({
        onLoad: 'check-sso',
        checkLoginIframe: false,
      })
    }

    return keycloak.register({
      redirectUri: window.location.origin,
    })
  },

  logout: async () => {
    const keycloak = getClient()

    if (!kcInitialized) {
      await safeInit({
        onLoad: 'check-sso',
        checkLoginIframe: false,
      })
    }

    return keycloak.logout({
      redirectUri: window.location.origin + '/login',
    })
  },

  getToken: async () => {
    const keycloak = getClient()

    if (!kcInitialized) {
      await client.restoreAuthState()
    }

    try {
      if (keycloak.token && keycloak.isTokenExpired(30)) {
        await keycloak.updateToken(60)
      }
    } catch (e) {
      console.error('Error refreshing token', e)
    }

    return keycloak.token
  },

  getUserMetadata: async () => {
    const keycloak = getClient()
    return keycloak.tokenParsed || null
  },

  restoreAuthState: async () => {
    const keycloak = getClient()

    await safeInit({
      onLoad: 'check-sso',
      checkLoginIframe: false,
    })

    return keycloak.tokenParsed || null
  },
}

/* ──────────────────────────────────────────────────────────
   CONECTOR CON REDWOOD AUTH
────────────────────────────────────────────────────────── */
function createAuthImplementation(client) {
  return {
    type: 'keycloak',
    client,

    login: () => client.login(),
    logout: () => client.logout(),
    signup: () => client.signup(),

    getToken: () => client.getToken(),
    getUserMetadata: () => client.getUserMetadata(),
    restoreAuthState: () => client.restoreAuthState(),

    // ← Clave para impedir el parpadeo al cargar
    loading: () => kcLoading,
  }
}

function createAuth() {
  return createAuthentication(createAuthImplementation(client))
}

export const { AuthProvider, useAuth } = createAuth()
