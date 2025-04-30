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
  // Cabeceras CORS para permitir solicitudes desde el frontend
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }

  // Manejo de solicitudes OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    }
  }

  try {
    // Verificamos que sea una solicitud POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido' }),
      }
    }

    // Extraemos el token del cuerpo de la solicitud
    let body
    try {
      body = JSON.parse(event.body)
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Formato de solicitud inválido' }),
      }
    }

    const { token } = body

    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Token no proporcionado' }),
      }
    }

    // Validamos el token con Keycloak y obtenemos la información del usuario
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

    if (!userInfo.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Información de usuario incompleta desde Keycloak',
        }),
      }
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
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'Usuario no encontrado en la base de datos',
          keycloakEmail: userInfo.email,
        }),
      }
    }

    // Devolvemos los datos del usuario encontrado
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
        // Información adicional de Keycloak
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
