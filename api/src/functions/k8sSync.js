import { syncK8sBasic, verifyK8sConnection } from 'src/lib/syncK8s/syncMain'
// 1. Importamos el decodificador de auth
import { authDecoder } from 'src/lib/auth'

export const handler = async (event, context) => {
  const origin = event.headers.origin
  
  const cors = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, authorization, auth-provider',
    'Access-Control-Allow-Credentials': 'true',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors }
  }

  // === 2. LÓGICA DE AUTENTICACIÓN MANUAL ===
  let usuarioId = 1 // Por defecto: System
  const authHeader = event.headers['authorization'] || event.headers['Authorization']

  if (authHeader) {
    try {
      // Decodificamos el token usando tu librería existente
      const user = await authDecoder(authHeader, 'function')
      if (user?.id) {
        usuarioId = user.id
      }
    } catch (err) {
      console.warn('Token inválido en K8s Sync:', err.message)
    }
  }
  // ==========================================

  try {
    const body = JSON.parse(event.body || '{}')
    const { endpointId, soloVerificar, trigger } = body
    
    const result = soloVerificar
      ? await verifyK8sConnection(endpointId)
      // 3. PASAMOS EL ID DE USUARIO A LA FUNCIÓN
      : await syncK8sBasic(endpointId, trigger || 'MANUAL', usuarioId)

    return { 
      statusCode: 200, 
      headers: cors, 
      body: JSON.stringify(result) 
    }

  } catch (e) {
    console.error('[k8sSync Function] Error:', e.message)

    const esBloqueo = e.message && e.message.includes('ya está en ejecución')
    const status = esBloqueo ? 409 : 500

    return {
      statusCode: status,
      headers: cors,
      body: JSON.stringify({ 
        success: false,
        error: e.message,
        esBloqueo 
      }),
    }
  }
}