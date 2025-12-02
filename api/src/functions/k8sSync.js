// src/functions/k8sSync.js
import { syncK8sBasic, verifyK8sConnection } from 'src/lib/syncK8s/syncMain'

export const handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors }
  }

  try {
    const body = JSON.parse(event.body)
    const { endpointId, soloVerificar } = body

    // Lógica condicional
    const result = soloVerificar
      ? await verifyK8sConnection(endpointId)
      : await syncK8sBasic(endpointId)

    return { 
      statusCode: 200, 
      headers: cors, 
      body: JSON.stringify(result) 
    }

  } catch (e) {
    console.error('[k8sSync Function] Error:', e.message)

    /* ============================================================
       🟢 DETECCIÓN DE BLOQUEO VALKEY
       Si syncMain lanza "ya está en ejecución", devolvemos 409
    ============================================================ */
    const esBloqueo = e.message && e.message.includes('ya está en ejecución')
    
    // 409 Conflict: Para avisar al frontend que está "Ocupado" pero no roto
    // 500 Server Error: Para fallos reales (conexión, base de datos, etc.)
    const status = esBloqueo ? 409 : 500

    return {
      statusCode: status,
      headers: cors,
      body: JSON.stringify({ 
        success: false, // Estandarizamos para que el front sepa que falló
        error: e.message,
        esBloqueo // Bandera útil para tu UI (para poner chip Amarillo en vez de Rojo)
      }),
    }
  }
}