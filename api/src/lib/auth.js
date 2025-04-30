// api/src/lib/auth.js

import fetch from 'node-fetch'

import { db } from 'src/lib/db'

// Configuración del servidor Keycloak
const issuer = process.env.KEYCLOAK_ISSUER // Ej: https://keycloak.ejemplo.org/realms/mi-realm

/**
 * Decodifica y valida el token de autenticación
 * @param {string} token - Token JWT proporcionado por Keycloak
 * @param {string} type - Tipo de autenticación (debe ser 'custom-auth')
 * @returns {Object|null} - Información del usuario autenticado o null si falla
 */
export const authDecoder = async (token, type) => {
  if (type !== 'custom-auth') return null

  if (!token) {
    console.error('Token no proporcionado')
    return null
  }

  try {
    // Validamos el token en Keycloak y obtenemos la información del usuario
    const response = await fetch(`${issuer}/protocol/openid-connect/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.error(
        'Error en validación de token Keycloak:',
        await response.text()
      )
      return null
    }

    const userInfo = await response.json()

    if (!userInfo || !userInfo.email) {
      console.error('Información de usuario incompleta desde Keycloak')
      return null
    }

    // Buscamos el usuario en nuestra base de datos por email
    const usuario = await db.usuario.findFirst({
      where: { email: userInfo.email.toLowerCase() },
      include: {
        usuario_roles: {
          include: {
            roles: true,
          },
        },
      },
    })

    if (!usuario) {
      console.warn(
        `Usuario con email ${userInfo.email} no encontrado en base de datos`
      )
      return { error: 'Usuario no encontrado en la base de datos' }
    }

    // Mapeamos la información del usuario de nuestra base de datos
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombres || '',
      apellido:
        `${usuario.primer_apellido || ''} ${usuario.segundo_apellido || ''}`.trim(),
      roles: usuario.usuario_roles.map((r) => r.roles.nombre),
      // Agregamos información adicional de Keycloak por si es necesaria
      keycloakId: userInfo.sub,
      keycloakRoles: userInfo.realm_access?.roles || [],
      ciudadaniaDigital:
        userInfo.preferred_username || userInfo.username || null,
    }
  } catch (error) {
    console.error('Error en authDecoder:', error)
    return null
  }
}

/**
 * Obtiene el usuario actual basado en la información decodificada del token
 * @param {Object} decoded - Información del usuario decodificada del token
 * @returns {Object|null} - Usuario actual o null si no hay usuario válido
 */
export const getCurrentUser = async (decoded) => {
  if (!decoded || decoded.error) return null
  return decoded
}

/**
 * Valida los roles del usuario para el control de acceso
 * @param {Array} roles - Roles requeridos para acceder a un recurso
 * @returns {function} - Función de validación para useRequireAuth
 */
export const hasRole = (roles) => {
  return ({ currentUser }) => {
    if (!currentUser) {
      return false
    }

    if (Array.isArray(roles)) {
      return currentUser.roles.some((role) => roles.includes(role))
    }

    return currentUser.roles.includes(roles)
  }
}

/**
 * Requiere que el usuario esté autenticado y tenga los roles necesarios.
 */
export const requireAuth = ({ roles } = {}) => {
  if (!context.currentUser) {
    throw new AuthenticationError("No tienes permiso para hacer esto.")
  }

  if (
    roles &&
    roles.length > 0 &&
    !roles.some((role) => context.currentUser.roles?.includes(role))
  ) {
    throw new ForbiddenError("No tienes acceso a este recurso.")
  }
}
