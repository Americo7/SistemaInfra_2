import { listarNodos, listarVMs } from 'src/services/proxmox/proxmox'
import { db } from 'src/lib/db'

export const handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: 'OK' }
  }

  console.log('=== [proxmoxSync] Solicitud Entrante ===')
  console.log('Método:', event.httpMethod)
  console.log('Body recibido (raw):', event.body)

  try {
    const body =
      typeof event.body === 'string' ? JSON.parse(event.body || '{}') : {}

    console.log('[proxmoxSync] Body parseado:', body)

    const { endpointId } = body

    if (!endpointId) {
      console.error('[proxmoxSync] ERROR: endpointId faltante')
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'endpointId es requerido' }),
      }
    }

    console.log(`[proxmoxSync] endpointId utilizado: ${endpointId}`)

    // Leer información del endpoint desde la BD
    const ep = await db.proxmoxEndpoint.findUnique({
      where: { id: endpointId },
    })

    console.log('=== [proxmoxSync] Datos del Endpoint Utilizado ===')
    console.log({
      id: ep.id,
      nombre: ep.nombre,
      ip: ep.ip,
      puerto: ep.puerto,
      usuario: ep.usuario,
      ssl: ep.ssl,
      token_id: ep.token_id,
      token_secret: ep.token_secret
        ? ep.token_secret.substring(0, 6) + '*****'
        : null,
    })

    const protocol = ep.ssl ? 'https' : 'http'
    const baseURL = `${protocol}://${ep.ip}:${ep.puerto}/api2/json`

    console.log('[proxmoxSync] URL utilizada para conectar:', baseURL)
    console.log('[proxmoxSync] SSL habilitado:', ep.ssl)

    console.log('=== [proxmoxSync] Solicitando Nodos ===')

    const nodos = await listarNodos(endpointId)

    console.log('[proxmoxSync] Nodos obtenidos:', nodos)

    const resultado = []

    for (const nodo of nodos) {
      console.log(`--- [proxmoxSync] Nodo: ${nodo.node} ---`)
      try {
        const vms = await listarVMs(endpointId, nodo.node)
        console.log(`[proxmoxSync] VMs obtenidas en ${nodo.node}:`, vms)

        resultado.push({ nodo: nodo.node, vms })
      } catch (errNodo) {
        console.error(
          `[proxmoxSync] Error obteniendo VMs en nodo ${nodo.node}:`,
          errNodo
        )

        resultado.push({
          nodo: nodo.node,
          error: errNodo.message,
          vms: [],
        })
      }
    }

    console.log('[proxmoxSync] Actualizando fecha_ultima_sync...')
    await db.proxmoxEndpoint.update({
      where: { id: endpointId },
      data: { fecha_ultima_sync: new Date() },
    })

    console.log('=== [proxmoxSync] FIN PROCESO EXITOSO ===')

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        mensaje: 'Conexión Proxmox exitosa',
        endpointUsado: {
          id: ep.id,
          nombre: ep.nombre,
          ip: ep.ip,
          puerto: ep.puerto,
          usuario: ep.usuario,
          ssl: ep.ssl,
        },
        nodos: resultado,
      }),
    }
  } catch (e) {
    console.error('=== [proxmoxSync] ERROR GENERAL ===', e)

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: e.message || 'Error desconocido en proxmoxSync',
      }),
    }
  }
}
