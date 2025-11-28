import fetch from 'node-fetch'
import { AuthenticationError, ForbiddenError } from '@redwoodjs/graphql-server'
import { db } from 'src/lib/db'

const issuer = process.env.KEYCLOAK_ISSUER

// Recortar valores según límite del schema
const max = (str, n) =>
  (str || '').toString().trim().substring(0, n)

/**
 * authDecoder
 * Valida el token con Keycloak y sincroniza usuario local
 */
export const authDecoder = async (token, type) => {
  if (!token) return null

  try {
    // ----------------------------------------------------
    // 1. Validación remota del token contra Keycloak
    // ----------------------------------------------------
    const userinfoUrl = `${issuer}/protocol/openid-connect/userinfo`

    const response = await fetch(userinfoUrl, {
      headers: {
        Authorization: `Bearer ${token.replace('Bearer ', '')}`,
      },
    })

    if (!response.ok) {
      console.error('Error validando token en Keycloak:', response.statusText)
      return null
    }

    const userInfo = await response.json()

    if (!userInfo?.email) {
      console.error('Token válido pero sin email en userinfo')
      return null
    }

    const emailLower = userInfo.email.toLowerCase()

    // ----------------------------------------------------
    // 2. Buscar usuario local por email
    // ----------------------------------------------------
    let usuario = await db.usuario.findFirst({
      where: { email: emailLower },
      include: {
        usuario_roles: {
          include: { roles: true },
        },
      },
    })

    // ----------------------------------------------------
    // 3. Crear usuario si no existe
    // ----------------------------------------------------
    if (!usuario) {
      const preferred = userInfo.preferred_username || ''
      const name = userInfo.given_name || userInfo.name || ''
      const family = userInfo.family_name || ''

      // Separación de apellidos
      const partesApellido = family.trim().split(/\s+/)
      const primerApellido = partesApellido[0] || ''
      const segundoApellido = partesApellido.slice(1).join(' ') || ''

      const ciudadano = userInfo.sub || ''

      usuario = await db.usuario.create({
        data: {
          email: max(emailLower, 100),

          // nombres y apellidos
          nombres: max(name, 40),
          primer_apellido: max(primerApellido, 40),
          segundo_apellido: max(segundoApellido, 40),

          // username del sistema
          nombre_usuario: max(preferred || emailLower.split('@')[0], 25),

          // documento
          nro_documento: max(preferred || '0', 20),

          // celular
          celular: max('0', 15),

          // id ciudadano digital
          id_ciudadano_digital: max(ciudadano, 30),

          // requeridos por el schema
          estado: 'activo',
          usuario_creacion: 0,
        },

        include: {
          usuario_roles: {
            include: { roles: true },
          },
        },
      })

      console.log(`Usuario creado automáticamente: ${emailLower}`)
    }


    // ----------------------------------------------------
    // 4. Retornar formato interno para Redwood
    // ----------------------------------------------------
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombres,
      apellido: `${usuario.primer_apellido || ''} ${usuario.segundo_apellido || ''}`.trim(),
      roles: usuario.usuario_roles?.map((r) => r.roles.nombre) || [],
      keycloakId: userInfo.sub,
      ciudadaniaDigital: userInfo.preferred_username,
    }

  } catch (error) {
    console.error('Excepción en authDecoder:', error)
    return null
  }
}

/**
 * getCurrentUser
 */
export const getCurrentUser = async (decoded) => decoded

/**
 * isAuthenticated
 */
export const isAuthenticated = () => !!context.currentUser

/**
 * hasRole
 */
export const hasRole = (roles) => {
  if (!isAuthenticated()) return false
  const userRoles = context.currentUser?.roles || []

  if (typeof roles === 'string') return userRoles.includes(roles)

  if (Array.isArray(roles))
    return roles.some((r) => userRoles.includes(r))

  return false
}

/**
 * requireAuth
 */
export const requireAuth = ({ roles } = {}) => {
  if (!isAuthenticated()) {
    throw new AuthenticationError('Debes iniciar sesión.')
  }

  if (roles && !hasRole(roles)) {
    throw new ForbiddenError('No tienes permisos para ver esto.')
  }
}
