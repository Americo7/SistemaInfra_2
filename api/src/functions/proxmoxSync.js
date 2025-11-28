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
    const { endpointId, soloVerificar } = body // <--- Leemos la bandera

    let result

    // === LOGICA DE DESICION ===
    if (soloVerificar) {
      // Ruta rápida: Solo comprueba conexión, NO toca la BD
      result = await verifyProxmoxConnection(endpointId)
    } else {
      // Ruta lenta: Sincronización completa (Clusters, Nodos, VMs)
      result = await syncProxmoxBasic(endpointId)
    }

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify(result), // result ya trae el { ok: true } dentro
    }
  } catch (e) {
    console.error(e)
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: e.message }),
    }
  }
}