import Keycloak from 'keycloak-js'
import { createAuthentication } from '@redwoodjs/auth'
import { navigate } from '@redwoodjs/router'

// Configuración de Keycloak como broker con Ciudadanía Digital
const keycloak = new Keycloak({
  url: process.env.KEYCLOAK_URL,
  realm: process.env.KEYCLOAK_REALM,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
})

// Almacenamos la ruta de redirección después del login
let redirectLocation

/**
 * Refresca el token automáticamente
 */
function setupTokenRefresh() {
  if (keycloak.token) {
    setInterval(() => {
      keycloak
        .updateToken(70)
        .catch(() => {
          console.warn('Error al refrescar token. Cerrando sesión.')
          keycloak.logout()
        })
    }, 60000)
  }
}

/**
 * Elimina las cookies de sesión de Keycloak
 */
function clearCookies() {
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    const cookieName = cookie.split('=')[0].trim()
    if (cookieName.startsWith('KEYCLOAK_')) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  }
}

/**
 * Inicia sesión con Ciudadanía Digital (broker)
 */
async function loginWithCiudadaniaDigital() {
  return keycloak.login({
    idpHint: 'ciudadania-digital',
  })
}

export const { AuthProvider, useAuth } = createAuthentication({
  type: 'custom-auth',

  /**
   * Restaurar autenticación al recargar página
   */
  restoreAuthState: async () => {
    try {
      const authenticated = await keycloak.init({
        onLoad: 'login-required',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        checkLoginIframe: false,
        pkceMethod: 'S256',
      })

      if (!authenticated) {
        console.warn('[restoreAuthState] No autenticado al hacer check-sso')
        return false
      }

      setupTokenRefresh()

      const validateResponse = await fetch('/api/validateUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: keycloak.token }),
      })

      if (!validateResponse.ok) {
        console.error(`[restoreAuthState] Validación fallida con código ${validateResponse.status}`)
        if (validateResponse.status === 404 || validateResponse.status === 403) {
          await keycloak.logout({
            redirectUri: `${window.location.origin}/login?error=unauthorized`,
          })
          clearCookies()
        }
        return false
      }

      return true
    } catch (error) {
      console.error('[restoreAuthState] Error al restaurar sesión:', error)
      return false
    }
  },


  /**
   * Función de login
   */
  login: async (options = {}) => {
    redirectLocation = options.redirectTo || window.location.pathname

    if (options.provider === 'ciudadania-digital') {
      return loginWithCiudadaniaDigital()
    }

    return keycloak.login(options)
  },

  /**
   * Función de logout
   */
  logout: async (options = {}) => {
    const redirectUri = options.redirectTo || `${window.location.origin}/login`
    clearCookies()
    await keycloak.logout({ redirectUri })
  },

  /**
   * Obtener token JWT
   */
  getToken: async () => keycloak.token || null,

  /**
   * Obtener metadatos del usuario
   */
  getUserMetadata: async () => {
    if (!keycloak.tokenParsed) {
      console.warn('[auth.js] No hay token disponible para obtener metadatos')
      return null
    }

    try {
      const fetchResponse = await fetch('/api/validateUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: keycloak.token }),
      })

      const contentType = fetchResponse.headers.get('content-type') || ''
      if (!fetchResponse.ok || !contentType.includes('application/json')) {
        const errorText = await fetchResponse.text()
        console.error(`[auth.js] Error al validar usuario (${fetchResponse.status}):`, errorText)

        if (fetchResponse.status === 404 || fetchResponse.status === 403) {
          console.warn('[auth.js] Usuario no válido. Haciendo logout...')
          await keycloak.logout({
            redirectUri: `${window.location.origin}/login?error=unauthorized`,
          })
          clearCookies()
          return null
        }

        return null
      }

      const userData = await fetchResponse.json()
      console.log('[auth.js] Usuario validado correctamente:', userData)

      if (redirectLocation) {
        const location = redirectLocation
        redirectLocation = null
        navigate(location)
      }

      return userData
    } catch (error) {
      console.error('[auth.js] Error al obtener metadatos del usuario:', error)
      return null
    }
  },

  importHook: () => import('@redwoodjs/auth'),
})

/*
Archivo requerido: web/public/silent-check-sso.html

<!DOCTYPE html>
<html>
<head>
  <script>
    parent.postMessage(location.href, location.origin);
  </script>
</head>
<body></body>
</html>
*/
