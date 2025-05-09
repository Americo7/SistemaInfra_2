// api/src/functions/validateEmail/validateEmail.js
import { db } from 'src/lib/db'

export const handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': 'http://localhost:8910',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    const { email } = JSON.parse(event.body)

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email requerido' }),
      }
    }

    const user = await db.usuario.findFirst({
      where: { email: email.trim().toLowerCase() },
    })

    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Usuario no encontrado' }),
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Usuario válido' }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error del servidor' }),
    }
  }
}
