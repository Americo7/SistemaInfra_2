// api/src/lib/auth.js
import fetch from 'node-fetch'
import { AuthenticationError, ForbiddenError } from '@redwoodjs/graphql-server'
import { db } from 'src/lib/db'

const issuer = process.env.KEYCLOAK_ISSUER
const max = (str, n) => (str || '').toString().trim().substring(0, n)

export const authDecoder = async (token, type) => {
  if (!token) return null

  try {
    // ... (Tu lógica de validación con Keycloak igual que antes) ...
    const userinfoUrl = `${issuer}/protocol/openid-connect/userinfo`
    const response = await fetch(userinfoUrl, {
      headers: { Authorization: `Bearer ${token.replace('Bearer ', '')}` },
    })

    if (!response.ok) return null
    const userInfo = await response.json()
    if (!userInfo?.email) return null
    const emailLower = userInfo.email.toLowerCase()

    // ... (Tu lógica de preparación de datosPersona igual que antes) ...
    const preferred = userInfo.preferred_username || ''
    const name = userInfo.given_name || userInfo.name || ''
    const family = userInfo.family_name || ''
    const partesApellido = family.trim().split(/\s+/)
    
    const datosPersona = {
      nombres: max(name, 40),
      primer_apellido: max(partesApellido[0], 40),
      segundo_apellido: max(partesApellido.slice(1).join(' '), 40),
      nombre_usuario: max(preferred || emailLower.split('@')[0], 25),
      id_ciudadano_digital: max(userInfo.sub, 30),
    }

    // ----------------------------------------------------
    // SINCRONIZACIÓN (UPSERT LÓGICO)
    // ----------------------------------------------------
    let usuario = await db.usuario.findFirst({
      where: { email: emailLower },
      include: { usuario_roles: { include: { roles: true } } },
    })

    if (usuario) {
      // ACTUALIZAR (Sin tocar roles)
      usuario = await db.usuario.update({
        where: { id: usuario.id },
        data: datosPersona,
        include: { usuario_roles: { include: { roles: true } } },
      })
    } else {
      // CREAR (Con rol por defecto)
      usuario = await db.usuario.create({
        data: {
          email: max(emailLower, 100),
          ...datosPersona,
          celular: max('0', 15),
          estado: 'ACTIVO',
          usuario_creacion: 0,
        },
      })
      // Asignar rol SI_VIEW por defecto
      const rolDefault = await db.role.findFirst({ where: { cod_tipo_rol: 'SI_VIEW' } })
      const sistemaDefault = await db.sistema.findFirst({ where: { codigo: 'SIS-IT' } })
      
      if (rolDefault && sistemaDefault) {
        await db.usuarioRol.create({
          data: { id_usuario: usuario.id, id_rol: rolDefault.id, id_sistema: sistemaDefault.id, estado: 'ACTIVO', usuario_creacion: 0 }
        })
      }
      // Recargar para tener los roles
      usuario = await db.usuario.findUnique({
        where: { id: usuario.id },
        include: { usuario_roles: { include: { roles: true } } },
      })
    }

    // ----------------------------------------------------
    // NUEVA LÓGICA: OBTENER NOMBRE DEL ROL DESDE PARAMÉTRICAS
    // ----------------------------------------------------
    const rolesCodes = usuario.usuario_roles?.map((r) => r.roles.cod_tipo_rol) || []
    
    // Tomamos el primer rol (rol principal) para mostrar en el Header
    let nombreRolMostrar = 'Usuario' 

    if (rolesCodes.length > 0) {
      const codigoRolPrincipal = rolesCodes[0] // Ej: 'SI_SUPERADM'

      // CONSULTA A LA TABLA PARAMETRO
      // 1. Filtrar por grupo 'TIPO_ROL'
      // 2. Buscar por código
      const parametroRol = await db.parametro.findFirst({
        where: {
          grupo: 'TIPO_ROL',
          codigo: codigoRolPrincipal
        }
      })

      if (parametroRol) {
        nombreRolMostrar = parametroRol.nombre // Ej: "Super Administrador"
      } else {
        // Fallback: Si no está en paramétricas, intentar usar el nombre de la tabla Role o el código
        nombreRolMostrar = usuario.usuario_roles[0]?.roles?.nombre || codigoRolPrincipal
      }
    }

    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombres,
      apellido: `${usuario.primer_apellido || ''} ${usuario.segundo_apellido || ''}`.trim(),
      roles: rolesCodes,
      keycloakId: userInfo.sub,
      
      // Enviamos el nombre bonito al frontend
      nombreRolDisplay: nombreRolMostrar 
    }

  } catch (error) {
    console.error('Auth Error:', error)
    return null
  }
}

// ... Resto de exports (getCurrentUser, isAuthenticated, etc) ...
export const getCurrentUser = async (decoded) => decoded
export const isAuthenticated = () => !!context.currentUser
export const hasRole = (roles) => { /* ... */ }
export const requireAuth = ({ roles } = {}) => { /* ... */ }