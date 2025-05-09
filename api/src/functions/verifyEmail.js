import { db } from 'src/lib/db'

export const handler = async (event) => {
  // Configuración de CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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

  // Verificamos que sea una solicitud POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' }),
    }
  }

  try {
    // Parseamos el cuerpo de la solicitud
    let body;
    try {
      body = JSON.parse(event.body || '{}')
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Formato JSON inválido' }),
      }
    }

    const { email } = body

    // Validamos que el email esté presente
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email no proporcionado' }),
      }
    }

    // Normalizamos el email
    const normalizedEmail = email.toLowerCase().trim()

    // Buscamos el usuario en la base de datos
    const usuario = await db.usuario.findFirst({
      where: { email: normalizedEmail },
    })

    // Respuesta según si encontramos el usuario o no
    if (!usuario) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          exists: false,
          error: 'Usuario no encontrado'
        }),
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        exists: true,
        email: usuario.email,
        message: 'Usuario verificado correctamente'
      }),
    }

  } catch (error) {
    console.error('Error en verifyEmail:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error interno del servidor',
        details: error.message
      }),
    }
  }
}
