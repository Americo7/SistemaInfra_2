// web/src/auth.js

import Keycloak from 'keycloak-js'

import { createAuthentication } from '@redwoodjs/auth'
import { navigate } from '@redwoodjs/router'

// Configuración de Keycloak para actuar como broker con Ciudadanía Digital
const keycloak = new Keycloak({
  url: process.env.KEYCLOAK_URL,
  realm: process.env.KEYCLOAK_REALM,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
})

// Almacenamos el estado de redirección para volver después del login
let redirectLocation

/**
 * Inicializa la instancia de Keycloak
 * @returns {Promise<boolean>} - True si la autenticación es exitosa
 */
async function initKeycloak() {
  try {
    // Inicializamos Keycloak con opciones para verificar silenciosamente si hay sesión
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      checkLoginIframe: false, // Deshabilitamos para evitar problemas con iframes
      pkceMethod: 'S256', // Mejor seguridad con PKCE
    })

    // Configuramos el refresco automático de tokens
    setupTokenRefresh()

    if (!authenticated) {
      // Si no está autenticado, guardamos la ubicación actual y redirigimos
      redirectLocation = window.location.pathname
      return false
    }
    console.log('Token de Keycloak:', keycloak.token)
    return authenticated
  } catch (error) {
    console.error('Error al inicializar Keycloak:', error)
    return false
  }
}

/**
 * Configura el refresco automático de tokens para mantener la sesión
 */
function setupTokenRefresh() {
  // Refrescar token si está a punto de expirar
  if (keycloak.token) {
    setInterval(() => {
      keycloak
        .updateToken(70) // Refrescar si queda menos del 70% del tiempo de validez
        .catch(() => {
          console.warn('Error al refrescar token. Cerrando sesión.')
          keycloak.logout()
        })
    }, 60000) // Verificar cada minuto
  }
}

/**
 * Redirige a Ciudadanía Digital a través de Keycloak
 */
async function loginWithCiudadaniaDigital() {
  return keycloak.login({
    idpHint: 'ciudadania-digital', // Identificador del proveedor en Keycloak
  })
}

/**
 * Función para borrar las cookies relacionadas con Keycloak
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

export const { AuthProvider, useAuth } = createAuthentication({
  type: 'custom-auth',

  // Restaura el estado de autenticación al cargar la página
  restoreAuthState: initKeycloak,

  // Función de inicio de sesión
  login: async (options = {}) => {
    // Guardamos la ubicación actual para redireccionar después del login
    redirectLocation = options.redirectTo || window.location.pathname

    if (options.provider === 'ciudadania-digital') {
      return loginWithCiudadaniaDigital()
    }

    return keycloak.login(options)
  },

  // Función de cierre de sesión
  logout: async (options = {}) => {
    const redirectUri = options.redirectTo || `${window.location.origin}/login`

    // Borramos las cookies de Keycloak
    clearCookies()

    // Realizamos el logout
    await keycloak.logout({ redirectUri })
  },

  // Obtiene el token JWT actual
  getToken: async () => keycloak.token || null,

  // Obtiene los metadatos del usuario autenticado
  getUserMetadata: async () => {
    if (!keycloak.tokenParsed) {
      console.warn('No hay token disponible para obtener metadatos del usuario')
      return null
    }

    try {
      // Validamos el usuario en nuestra base de datos
      const response = await fetch('/.redwood/functions/validateUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: keycloak.token }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error al validar usuario:', errorData)

        if (response.status === 404) {
          console.warn('Usuario no encontrado en la base de datos.')

          // Deslogueo completo en RedwoodJS
          await keycloak.logout()

          // Borramos las cookies
          clearCookies()

          // Reinicia la sesión de Keycloak
          window.location.href = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(window.location.origin + '/login?error=unauthorized')}`
          return null
        }

        throw new Error('Error al validar usuario')
      }

      const userData = await response.json()

      // Si hay una redirección pendiente, la ejecutamos
      if (redirectLocation) {
        const location = redirectLocation
        redirectLocation = null
        navigate(location)
      }

      return userData
    } catch (error) {
      console.error('Error al obtener metadatos del usuario:', error)
      return null
    }
  },

  importHook: () => import('@redwoodjs/auth'),
})

// Archivo HTML para el silent-check-sso
// Debe existir en web/public/silent-check-sso.html con el siguiente contenido:
/*
<!DOCTYPE html>
<html>
<head>
  <script>
    parent.postMessage(location.href, location.origin);
  </script>
</head>
<body>
  </body>
</html>
*/
