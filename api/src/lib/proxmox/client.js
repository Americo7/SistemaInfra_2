import axios from 'axios'
import https from 'https'
import { db } from 'src/lib/db'

export const getProxmoxClient = async (endpointId) => {
  const ep = await db.proxmoxEndpoint.findUnique({
    where: { id: endpointId },
  })

  if (!ep) throw new Error('Endpoint Proxmox no encontrado')

  const protocol = ep.ssl ? 'https' : 'http'
  const baseURL = `${protocol}://${ep.ip}:${ep.puerto}/api2/json`
  const token = `PVEAPIToken=${ep.usuario}!${ep.token_id}=${ep.token_secret}`

  const httpsAgent = ep.ssl
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined

  return axios.create({
    baseURL,
    headers: { Authorization: token },
    timeout: 20000,
    httpsAgent,
  })
}
