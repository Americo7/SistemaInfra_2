// src/functions/proxmoxSync.js
import { syncProxmoxBasic, verifyProxmoxConnection } from 'src/lib/syncProxmox/syncMain'

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

    let result

    // === LOGICA DE DECISIÓN ===
    if (soloVerificar) {
      // Ruta rápida: Solo comprueba conexión, NO toca la BD ni pone Locks
      result = await verifyProxmoxConnection(endpointId)
    } else {
      // Ruta lenta: Sincronización completa protegida por Valkey Lock
      // Si ya hay una en curso, esto lanzará un Error.
      result = await syncProxmoxBasic(endpointId)
    }

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify(result),
    }

  } catch (e) {
    console.error('[proxmoxSync Function] Error:', e.message)

    // Detección de Bloqueo Valkey
    // El mensaje debe coincidir con el throw en syncMain.js
    const esBloqueo = e.message && e.message.includes('ya está en ejecución')
    
    // 409 = Conflict (Ideal para indicar "Recurso ocupado")
    // 500 = Server Error (Fallo real)
    const status = esBloqueo ? 409 : 500

    return {
      statusCode: status,
      headers: cors,
      body: JSON.stringify({ 
        success: false, 
        error: e.message,
        esBloqueo // Flag explícita para el frontend
      }),
    }
  }
}