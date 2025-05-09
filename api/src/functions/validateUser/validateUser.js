// api/src/functions/validateUser.js

import fetch from 'node-fetch'
import { db } from 'src/lib/db'

// Configuración del servidor Keycloak
const issuer = process.env.KEYCLOAK_ISSUER

/**
 * Función serverless para validar el usuario en la base de datos
 * @param {Object} event - Evento HTTP con el token JWT
 * @returns {Object} - Respuesta HTTP con información del usuario o error
 */
export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    }
  }

  try {
    if (event.httpMethod !== 'POST') {
      console.warn('Método no permitido:', event.httpMethod)
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido' }),
      }
    }

    let body
    try {
      body = JSON.parse(event.body)
    } catch (e) {
      console.error('Error al parsear el cuerpo:', event.body)
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Formato de solicitud inválido' }),
      }
    }

    const { token } = body

    if (!token) {
      console.warn('Token no proporcionado')
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Token no proporcionado' }),
      }
    }

    console.log('Validando token con Keycloak...')

    const userInfoResponse = await fetch(
      `${issuer}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text()
      console.error('Error al validar token con Keycloak:', errorText)

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: 'Token inválido o expirado',
          details: errorText,
        }),
      }
    }

    const userInfo = await userInfoResponse.json()
    console.log('Información de usuario recibida de Keycloak:', userInfo)

    if (!userInfo.email) {
      console.error('No se recibió el email del usuario desde Keycloak')
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Información de usuario incompleta desde Keycloak',
        }),
      }
    }

    console.log('Buscando usuario en la base de datos con email:', userInfo.email)

    const usuario = await db.usuario.findFirst({
      where: {
        email: {
          equals: userInfo.email,
          mode: 'insensitive',
        },
      },
      include: {
        usuario_roles: {
          include: {
            roles: true,
          },
        },
      },
    })

    if (!usuario) {
      console.warn(`Usuario con email ${userInfo.email} no encontrado en base de datos`)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'Usuario no encontrado en la base de datos',
          keycloakEmail: userInfo.email,
        }),
      }
    }

    console.log('Usuario encontrado en la base de datos:', usuario)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombres || '',
        apellido:
          `${usuario.primer_apellido || ''} ${usuario.segundo_apellido || ''}`.trim(),
        roles: usuario.usuario_roles.map((r) => r.roles.nombre),
        keycloakId: userInfo.sub,
        keycloakPreferredUsername: userInfo.preferred_username || null,
        keycloakRoles: userInfo.realm_access?.roles || [],
      }),
    }
  } catch (error) {
    console.error('Error en validateUser:', error)

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error interno del servidor',
        message: error.message,
      }),
    }
  }
}
