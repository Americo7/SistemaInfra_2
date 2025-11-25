import axios from 'axios'
import https from 'https'
import { db } from 'src/lib/db'

/**
 * Construye un cliente Axios para comunicarse con Proxmox.
 * Incluye:
 * - Logs detallados
 * - Manejo de certificados autofirmados
 * - Debug de token, URL, y SSL
 * - Trazas de conexión
 */
export const getProxmoxClient = async (endpointId) => {
  console.log('=== [Proxmox] getProxmoxClient ===')
  console.log('Endpoint ID:', endpointId)

  const ep = await db.proxmoxEndpoint.findUnique({
    where: { id: endpointId },
  })

  console.log('[Proxmox] Datos del endpoint:', ep)

  if (!ep) {
    throw new Error('ProxmoxEndpoint no encontrado')
  }

  if (!ep.usuario || !ep.token_id || !ep.token_secret) {
    throw new Error(
      'Credenciales Proxmox incompletas: usuario, token_id o token_secret faltantes'
    )
  }

  const protocol = ep.ssl ? 'https' : 'http'
  const baseURL = `${protocol}://${ep.ip}:${ep.puerto}/api2/json`
  console.log('[Proxmox] URL base generada:', baseURL)

  const token = `PVEAPIToken=${ep.usuario}!${ep.token_id}=${ep.token_secret}`

  console.log('[Proxmox] Usando protocolo SSL:', ep.ssl)
  if (ep.ssl) {
    console.log('[Proxmox] SSL está habilitado → aceptando certificados autofirmados')
  }

  const httpsAgent =
    ep.ssl === true
      ? new https.Agent({
          rejectUnauthorized: false, // Permitir certificados autofirmados
        })
      : undefined

  console.log('[Proxmox] Preparando cliente Axios...')

  const client = axios.create({
    baseURL,
    headers: {
      Authorization: token,
    },
    timeout: 20000,
    validateStatus: () => true,
    httpsAgent,
  })

  console.log('[Proxmox] Cliente Axios creado exitosamente.')
  return client
}

/**
 * Lista nodos disponibles en el cluster Proxmox
 * Incluye:
 * - logs de conexión
 * - traza del request y response
 * - manejo ampliado de errores
 */
export const listarNodos = async (endpointId) => {
  console.log('=== [Proxmox] listarNodos() ===')
  console.log('Endpoint ID:', endpointId)

  const client = await getProxmoxClient(endpointId)

  console.log('[Proxmox] GET /nodes → Enviando petición...')

  let res
  try {
    res = await client.get('/nodes')
  } catch (err) {
    console.error('[Proxmox] ERROR de conexión a /nodes:', err)
    throw new Error(`Error conectando a Proxmox /nodes: ${err.message}`)
  }

  console.log('[Proxmox] Respuesta cruda de /nodes:', {
    status: res.status,
    statusText: res.statusText,
    data: res.data,
  })

  if (res.status !== 200) {
    const msg = res?.data?.errors ?? res?.statusText
    console.error('[Proxmox] Error HTTP en /nodes:', msg)
    throw new Error(`Error Proxmox /nodes [${res.status}]: ${msg}`)
  }

  if (!res?.data?.data) {
    console.error('[Proxmox] ERROR: /nodes devolvió formato inesperado')
    throw new Error('Respuesta inesperada de Proxmox /nodes: falta data.data')
  }

  console.log('[Proxmox] Nodos encontrados:', res.data.data)
  return res.data.data
}

/**
 * Lista VMs en un nodo Proxmox
 */
export const listarVMs = async (endpointId, nodeName) => {
  console.log('=== [Proxmox] listarVMs() ===')
  console.log('Endpoint ID:', endpointId)
  console.log('Nodo:', nodeName)

  const client = await getProxmoxClient(endpointId)

  console.log(`[Proxmox] GET /nodes/${nodeName}/qemu → Enviando petición...`)

  let res
  try {
    res = await client.get(`/nodes/${nodeName}/qemu`)
  } catch (err) {
    console.error('[Proxmox] ERROR de conexión a /qemu:', err)
    throw new Error(
      `Error conectando a Proxmox /nodes/${nodeName}/qemu: ${err.message}`
    )
  }

  console.log('[Proxmox] Respuesta cruda de /qemu:', {
    status: res.status,
    statusText: res.statusText,
    data: res.data,
  })

  if (res.status !== 200) {
    const msg = res?.data?.errors ?? res?.statusText
    console.error('[Proxmox] Error HTTP en /qemu:', msg)
    throw new Error(
      `Error Proxmox /nodes/${nodeName}/qemu [${res.status}]: ${msg}`
    )
  }

  if (!res?.data?.data) {
    console.error('[Proxmox] ERROR: /qemu devolvió formato inesperado')
    throw new Error(
      `Respuesta inesperada en /nodes/${nodeName}/qemu: falta data.data`
    )
  }

  console.log('[Proxmox] VMs encontradas en nodo', nodeName, res.data.data)
  return res.data.data
}
