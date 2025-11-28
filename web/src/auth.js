import Keycloak from 'keycloak-js'
import { createAuthentication } from '@redwoodjs/auth'

let kc = null
let kcInitialized = false

const ensureEnv = () => {
  if (!process.env.KEYCLOAK_URL) throw new Error('Missing KEYCLOAK_URL')
  if (!process.env.KEYCLOAK_REALM) throw new Error('Missing KEYCLOAK_REALM')
  if (!process.env.KEYCLOAK_CLIENT_ID) throw new Error('Missing KEYCLOAK_CLIENT_ID')
}

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

const safeInit = async (options) => {
  const keycloak = getClient()

  // 1. Detección de entorno inseguro (HTTP por IP)
  // Si falta window.crypto, Keycloak fallará fatalmente. Lo detectamos antes.
  if (typeof window !== 'undefined' && !window.crypto) {
    console.warn("⚠️ ADVERTENCIA: Web Crypto API no disponible. La autenticación fallará si no usas Localhost o HTTPS.")
    kcInitialized = true 
    return null // Retornamos null para que la app cargue sin usuario en vez de crashear
  }

  // 2. Evitar doble inicialización
  if (kcInitialized) {
    return keycloak
  }

  // 3. Inicialización controlada
  kcInitialized = true
  try {
    await keycloak.init(options)
  } catch (e) {
    console.warn('Keycloak init failed. Continuando como no autenticado.', e ? e.message : e)
    // No reseteamos kcInitialized para evitar bucles infinitos en React
    return keycloak 
  }

  return keycloak
}

const client = {
  login: async () => {
    const keycloak = getClient()
    
    // Paso 1: Asegurarnos que la librería base esté inicializada
    if (!kcInitialized) {
       await safeInit({ 
         onLoad: 'check-sso', 
         checkLoginIframe: false 
       })
    }

    // Paso 2: FORZAR la redirección. 
    // Esto es lo que faltaba: llamar explícitamente a login() para que te lleve a Ciudadanía Digital.
    try {
      await keycloak.login({
        redirectUri: window.location.origin,
      })
    } catch (e) {
      console.error("Error iniciando login explícito:", e)
      throw e
    }

    return keycloak.tokenParsed
  },

  signup: async () => {
    const keycloak = getClient()
    if (!kcInitialized) {
       await safeInit({ onLoad: 'check-sso', checkLoginIframe: false })
    }
    
    await keycloak.register({
      redirectUri: window.location.origin,
    })
    
    return keycloak.tokenParsed
  },

  logout: async () => {
    const keycloak = getClient()
    // Si no se inicializó, hacemos un init básico para poder llamar a logout
    if (!kcInitialized) {
       await safeInit({ onLoad: 'check-sso', checkLoginIframe: false })
    }
    
    return keycloak.logout({
      redirectUri: window.location.origin + '/login',
    })
  },

  getToken: async () => {
    const keycloak = getClient()
    
    // Si no está inicializado, intentamos restaurar estado primero
    if (!kcInitialized) {
      await client.restoreAuthState()
    }

    try {
      // Actualizar token si expira en menos de 30 segundos
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
    
    // safeInit ahora atrapa errores, evitando pantalla blanca
    await safeInit({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      // IMPORTANTE: checkLoginIframe en false evita errores de CSP (bloqueo de iframes)
    })

    return keycloak.tokenParsed || null
  },
}

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
  }
}

function createAuth() {
  return createAuthentication(createAuthImplementation(client))
}

export const { AuthProvider, useAuth } = createAuth()