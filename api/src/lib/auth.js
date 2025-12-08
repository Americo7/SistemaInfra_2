import fetch from 'node-fetch'
import https from 'https'
import crypto from 'crypto'
import { AuthenticationError, ForbiddenError } from '@redwoodjs/graphql-server'
import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

const issuer = process.env.KEYCLOAK_ISSUER

const max = (str, n) => (str || '').toString().trim().substring(0, n)

// --- CONFIGURACIÓN SSL BLINDADA ---
const sslAgent = new https.Agent({
  // 1. Permisividad básica
  rejectUnauthorized: false,
  // 2. Compatibilidad con servidores legacy
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
  ciphers: 'DEFAULT@SECLEVEL=0',
  minVersion: 'TLSv1',
  
  // 3. LA SOLUCIÓN AL ERROR DE CAMBIO DE PÁGINA:
  // Desactivamos la reutilización de sockets.
  // Esto obliga a crear una conexión limpia en cada petición,
  // evitando el error de "unexpected message" durante la renegociación.
  keepAlive: false,
  maxSockets: 1
})

export const authDecoder = async (token, type) => {
  if (!token) return null

  try {
    const userinfoUrl = `${issuer}/protocol/openid-connect/userinfo`
    
    // FETCH (Sin cache, conexión fresca)
    const response = await fetch(userinfoUrl, {
      headers: { 
        Authorization: `Bearer ${token.replace('Bearer ', '')}`,
        'Connection': 'close' // Refuerzo para cerrar conexión
      },
      agent: sslAgent, 
    })

    if (!response.ok) {
      console.error(`Auth Error: Keycloak status ${response.status}`)
      return null
    }
    
    const userInfo = await response.json()
    if (!userInfo?.email) return null
    
    const emailLower = userInfo.email.toLowerCase()
    
    // Preparación de datos
    const preferred = userInfo.preferred_username || ''
    const name = userInfo.given_name || userInfo.name || ''
    const family = userInfo.family_name || ''
    const partesApellido = family.trim().split(/\s+/)
    
    const documentoFallback = preferred || `TEMP-${Math.floor(Math.random() * 10000)}`

    // Limpieza de datos (Evita error P2000)
    const datosPersona = {
      nombres: max(name, 30),
      primer_apellido: max(partesApellido[0], 30),
      segundo_apellido: max(partesApellido.slice(1).join(' '), 30),
      nombre_usuario: max(preferred || emailLower.split('@')[0], 15),
      id_ciudadano_digital: max(userInfo.sub, 20), // Corte a 20 chars
    }

    // --- LÓGICA DE BASE DE DATOS ---
    let usuario = await db.usuario.findFirst({
      where: { email: emailLower },
      include: { usuario_roles: { include: { roles: true } } },
    })

    if (usuario) {
      // ACTUALIZAR
      usuario = await db.usuario.update({
        where: { id: usuario.id },
        data: datosPersona,
        include: { usuario_roles: { include: { roles: true } } },
      })
    } else {
      // CREAR
      usuario = await db.usuario.create({
        data: {
          email: max(emailLower, 50),
          ...datosPersona,
          nro_documento: max(documentoFallback, 15), 
          celular: max('0', 10),
          estado: 'ACTIVO',
          usuario_creacion: 1,
        },
      })

      // Roles por defecto
      const rolDefault = await db.role.findFirst({ where: { cod_tipo_rol: 'SI_VIEW' } })
      const sistemaDefault = await db.sistema.findFirst({ where: { codigo: 'SIS-IT' } })
      
      if (rolDefault && sistemaDefault) {
        await db.usuarioRol.create({
          data: { 
            id_usuario: usuario.id, 
            id_rol: rolDefault.id, 
            id_sistema: sistemaDefault.id, 
            estado: 'ACTIVO', 
            usuario_creacion: 1
          }
        })
      }
      
      usuario = await db.usuario.findUnique({
        where: { id: usuario.id },
        include: { usuario_roles: { include: { roles: true } } },
      })
    }

    // RETORNO DE SESIÓN
    const rolesCodes = usuario.usuario_roles?.map((r) => r.roles.cod_tipo_rol) || []
    let nombreRolMostrar = 'Usuario' 

    if (rolesCodes.length > 0) {
      const codigoRolPrincipal = rolesCodes[0]
      const parametroRol = await db.parametro.findFirst({
        where: { grupo: 'TIPO_ROL', codigo: codigoRolPrincipal }
      })
      if (parametroRol) nombreRolMostrar = parametroRol.nombre
      else nombreRolMostrar = usuario.usuario_roles[0]?.roles?.nombre || codigoRolPrincipal
    }

    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre_usuario, 
      apellido: '', 
      nombre_real_completo: `${usuario.nombres} ${usuario.primer_apellido}`,
      roles: rolesCodes,
      keycloakId: userInfo.sub,
      nombreRolDisplay: nombreRolMostrar 
    }

  } catch (error) {
    console.error('Auth Error CRÍTICO:', error)
    return null
  }
}

// Helpers
export const getCurrentUser = async (decoded) => { return decoded }
export const isAuthenticated = () => { return !!context.currentUser }
export const hasRole = (roles) => {
  if (!isAuthenticated()) return false
  const currentUserRoles = context.currentUser.roles
  if (typeof roles === 'string') {
    if (typeof currentUserRoles === 'string') return currentUserRoles === roles
    else if (Array.isArray(currentUserRoles)) return currentUserRoles.some((allowedRole) => roles === allowedRole)
  }
  if (Array.isArray(roles)) {
    if (Array.isArray(currentUserRoles)) return currentUserRoles.some((allowedRole) => roles.includes(allowedRole))
    else if (typeof currentUserRoles === 'string') return roles.some((allowedRole) => currentUserRoles === allowedRole)
  }
  return false
}
export const requireAuth = ({ roles } = {}) => {
  if (!isAuthenticated()) throw new AuthenticationError("No tienes permiso.")
  if (roles && !hasRole(roles)) throw new ForbiddenError("No tienes roles.")
}