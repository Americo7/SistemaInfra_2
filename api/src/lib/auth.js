import fetch from 'node-fetch'
import https from 'https'
import crypto from 'crypto'
import { AuthenticationError, ForbiddenError } from '@redwoodjs/graphql-server'
import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

const issuer = process.env.KEYCLOAK_ISSUER

// Helper para recortar strings a la longitud de la BD
const max = (str, n) => (str || '').toString().trim().substring(0, n)

// --- CONFIGURACIÓN SSL BLINDADA (SOLUCIÓN FINAL) ---
const sslAgent = new https.Agent({
  // 1. ESTABILIDAD: Cierra el socket tras cada petición.
  // Evita el error de "unexpected message" por sockets desincronizados.
  keepAlive: false,
  maxSockets: 1,

  // 2. COMPATIBILIDAD: Forzamos TLS 1.2.
  // Aunque el servidor soporte 1.3, forzar 1.2 evita problemas con 
  // extensiones modernas que algunos firewalls bloquean.
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.2',

  // 3. SEGURIDAD DE RED: Desactivar reanudación de sesión.
  // Reduce el tamaño del paquete "ClientHello" para pasar filtros estrictos.
  secureOptions: crypto.constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION,

  // 4. CERTIFICADOS: Permisivo para evitar problemas de CA en Docker/Local
  rejectUnauthorized: false, 
})

export const authDecoder = async (token, type) => {
  // Si no hay token, no hay usuario (retorna null)
  if (!token) return null

  // Limpieza preventiva del prefijo Bearer
  const cleanToken = token.replace('Bearer ', '').trim()

  try {
    const userinfoUrl = `${issuer}/protocol/openid-connect/userinfo`
    
    // --- PETICIÓN AL PROVEEDOR DE IDENTIDAD ---
    const response = await fetch(userinfoUrl, {
      method: 'GET',
      headers: { 
        Authorization: `Bearer ${cleanToken}`,
        'Connection': 'close', // Refuerzo para cerrar conexión TCP
        'Accept': 'application/json'
      },
      agent: sslAgent, // Inyección del agente SSL configurado
      timeout: 30000   // Timeout de 30s para evitar cuelgues
    })

    if (!response.ok) {
      console.error(`Auth Error: Keycloak status ${response.status} - ${response.statusText}`)
      // Si el token es inválido o expiró, retornamos null
      return null
    }
    
    const userInfo = await response.json()
    
    // Validación mínima de datos
    if (!userInfo?.email) {
      console.warn('Auth Warning: Usuario sin email en el token')
      return null
    }
    
    const emailLower = userInfo.email.toLowerCase()
    
    // --- PREPARACIÓN DE DATOS ---
    const preferred = userInfo.preferred_username || ''
    const name = userInfo.given_name || userInfo.name || ''
    const family = userInfo.family_name || ''
    const partesApellido = family.trim().split(/\s+/)
    
    const documentoFallback = preferred || `TEMP-${Math.floor(Math.random() * 10000)}`

    // Objeto limpio para Prisma (respetando límites de caracteres)
    const datosPersona = {
      nombres: max(name, 30),
      primer_apellido: max(partesApellido[0], 30),
      segundo_apellido: max(partesApellido.slice(1).join(' '), 30),
      nombre_usuario: max(preferred || emailLower.split('@')[0], 15),
      id_ciudadano_digital: max(userInfo.sub, 20),
    }

    // --- SINCRONIZACIÓN CON BASE DE DATOS LOCAL ---
    let usuario = await db.usuario.findFirst({
      where: { email: emailLower },
      include: { usuario_roles: { include: { roles: true } } },
    })

    if (usuario) {
      // ACTUALIZAR DATOS SI EXISTE
      usuario = await db.usuario.update({
        where: { id: usuario.id },
        data: datosPersona,
        include: { usuario_roles: { include: { roles: true } } },
      })
    } else {
      // CREAR USUARIO NUEVO
      usuario = await db.usuario.create({
        data: {
          email: max(emailLower, 50),
          ...datosPersona,
          nro_documento: max(documentoFallback, 15), 
          celular: max('0', 10), // Valor por defecto
          estado: 'ACTIVO',
          usuario_creacion: 1, // Asumiendo ID 1 como sistema/admin
        },
      })

      // Asignar Roles por Defecto
      const rolDefault = await db.role.findFirst({ where: { cod_tipo_rol: 'SI_USER' } })
      const sistemaDefault = await db.sistema.findFirst({ where: { codigo: 'SIS001' } })
      
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
      
      // Recargar usuario con roles incluidos
      usuario = await db.usuario.findUnique({
        where: { id: usuario.id },
        include: { usuario_roles: { include: { roles: true } } },
      })
    }

    // --- CONSTRUCCIÓN DE SESIÓN (CONTEXT) ---
    const rolesCodes = usuario.usuario_roles?.map((r) => r.roles.cod_tipo_rol) || []
    
    // Determinar nombre del rol principal para mostrar en UI
    let nombreRolMostrar = 'Usuario' 
    if (rolesCodes.length > 0) {
      const codigoRolPrincipal = rolesCodes[0]
      const parametroRol = await db.parametro.findFirst({
        where: { grupo: 'TIPO_ROL', codigo: codigoRolPrincipal }
      })
      nombreRolMostrar = parametroRol ? parametroRol.nombre : (usuario.usuario_roles[0]?.roles?.nombre || codigoRolPrincipal)
    }

    // Retorno final al currentUser
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre_usuario, 
      apellido: '', // Campo legacy si se requiere
      nombre_real_completo: `${usuario.nombres} ${usuario.primer_apellido}`,
      roles: rolesCodes,
      keycloakId: userInfo.sub,
      nombreRolDisplay: nombreRolMostrar 
    }

  } catch (error) {
    // Log detallado para depuración en servidor
    console.error('Auth Error CRÍTICO (Fallo SSL/Red):', error.message)
    return null
  }
}

// --- HELPERS DE REDWOOD ---
export const getCurrentUser = async (decoded) => { return decoded }

export const isAuthenticated = () => { return !!context.currentUser }

export const hasRole = (roles) => {
  if (!isAuthenticated()) return false
  const currentUserRoles = context.currentUser.roles || []
  
  if (typeof roles === 'string') {
    if (typeof currentUserRoles === 'string') return currentUserRoles === roles
    else if (Array.isArray(currentUserRoles)) return currentUserRoles.includes(roles)
  }
  
  if (Array.isArray(roles)) {
    if (Array.isArray(currentUserRoles)) return currentUserRoles.some((r) => roles.includes(r))
    else if (typeof currentUserRoles === 'string') return roles.includes(currentUserRoles)
  }
  
  return false
}

export const requireAuth = ({ roles } = {}) => {
  if (!isAuthenticated()) throw new AuthenticationError("No tienes permiso.")
  if (roles && !hasRole(roles)) throw new ForbiddenError("No tienes roles necesarios.")
}