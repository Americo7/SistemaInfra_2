import { syncProxmoxBasic, verifyProxmoxConnection } from 'src/lib/syncProxmox/syncMain'
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

  // === DEBUG TRACE INICIO ===
  console.log('--- 🔍 INICIO DEBUG SYNC MANUAL ---')
  
  let usuarioId = 1 // Default
  
  // 1. VERIFICAR HEADERS (A veces llegan en minúsculas)
  const authHeader = event.headers['authorization'] || event.headers['Authorization']
  console.log(`1. Header Authorization recibido: ${authHeader ? 'SI (Oculto por seguridad)' : 'NO ❌'}`)

  if (authHeader) {
    try {
      // 2. VERIFICAR DECODIFICACIÓN
      console.log('2. Intentando decodificar token...')
      const user = await authDecoder(authHeader, 'function')
      
      console.log('3. Resultado authDecoder:', JSON.stringify(user, null, 2))

      if (user && user.id) {
        usuarioId = user.id
        console.log(`✅ 4. ID DETECTADO: ${usuarioId}`)
      } else {
        console.warn('⚠️ 4. authDecoder devolvió usuario null o sin ID.')
      }
    } catch (err) {
      console.error('❌ Error crítico decodificando:', err.message)
    }
  } else {
    console.warn('⚠️ No hay header Authorization. ¿El frontend lo envió?')
  }
  
  console.log(`5. ID FINAL QUE SE PASARÁ A LA LÓGICA: ${usuarioId}`)
  // === DEBUG TRACE FIN ===

  try {
    const body = JSON.parse(event.body || '{}')
    const { endpointId, soloVerificar, trigger } = body
    
    let result

    if (soloVerificar) {
      result = await verifyProxmoxConnection(endpointId)
    } else {
      // PASAMOS EL ID
      result = await syncProxmoxBasic(endpointId, trigger || 'MANUAL', usuarioId)
    }

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify(result),
    }

  } catch (e) {
    console.error('[proxmoxSync] Error:', e.message)
    // ... (resto del catch igual)
    const esBloqueo = e.message && e.message.includes('ya está en ejecución')
    return { statusCode: esBloqueo ? 409 : 500, headers: cors, body: JSON.stringify({ success: false, error: e.message }) }
  }
}