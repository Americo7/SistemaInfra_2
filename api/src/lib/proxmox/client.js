// src/lib/proxmox/client.js
import axios from 'axios'
import https from 'https'
import { db } from 'src/lib/db'
import { valkey } from 'src/lib/valkey' // 🟢 Importamos Valkey

export const getProxmoxClient = async (endpointId) => {
  // Key para cachear la configuración de conexión
  const cacheKey = `config:px:endpoint:${endpointId}`
  
  let ep

  // 1. Intentar obtener configuración de memoria (Valkey)
  const cachedConfig = await valkey.get(cacheKey)

  if (cachedConfig) {
    ep = JSON.parse(cachedConfig)
  } else {
    // 2. Si no está, buscar en DB
    ep = await db.proxmoxEndpoint.findUnique({
      where: { id: endpointId },
    })

    if (!ep) throw new Error('Endpoint Proxmox no encontrado')

    // 3. Guardar en Valkey por 60 segundos
    // Suficiente para cubrir un ciclo de sync sin saturar la DB
    await valkey.set(cacheKey, JSON.stringify(ep), 'EX', 60)
  }

  // --- Construcción del Cliente (Igual que antes) ---
  const protocol = ep.ssl ? 'https' : 'http'
  const baseURL = `${protocol}://${ep.ip}:${ep.puerto}/api2/json`
  const token = `PVEAPIToken=${ep.usuario}!${ep.token_id}=${ep.token_secret}`

  const httpsAgent = ep.ssl
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined

  return axios.create({
    baseURL,
    headers: { Authorization: token },
    timeout: 5000,
    httpsAgent,
  })
}