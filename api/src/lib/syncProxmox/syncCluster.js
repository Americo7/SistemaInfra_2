// lib/syncProxmox/syncCluster.js
import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'
import { getProxmoxClient } from '../proxmox/client'
import { cacheFetch } from '../proxmox/cache'

export const syncCluster = async (endpoint) => {
  // 1. OBTENER USUARIO (si no hay sesión → 1)
  const userId = context.currentUser?.id || 1

  const client = await getProxmoxClient(endpoint.id)

  // 2. Cluster status con caché
  const items = await cacheFetch(
    `px:${endpoint.id}:cluster:status`,
    10,
    async () => {
      const res = await client.get('/cluster/status')
      return res.data?.data || []
    }
  )

  // 3. Detectar cluster o standalone
  const realCluster = items.find((i) => i.type === 'cluster')

  const nombreCluster = realCluster
    ? realCluster.name
    : `${endpoint.nombre}-STANDALONE`

  const descripcionCluster = realCluster
    ? `Cluster Proxmox (${nombreCluster})`
    : `Proxmox standalone en ${endpoint.nombre}`

  // 4. identity_key único y estable
  const identityKey = `proxmox-cluster:${endpoint.id}:${nombreCluster}`

  // 5. Buscar por identity_key
  let existente = await db.cluster.findUnique({
    where: { identity_key: identityKey },
  })

  // 6. Fallback: nombre + endpoint
  if (!existente) {
    existente = await db.cluster.findUnique({
      where: {
        nombre_id_proxmox_endpoint: {
          nombre: nombreCluster,
          id_proxmox_endpoint: endpoint.id,
        },
      },
    })
  }

  // 7. UPDATE si existe
  if (existente) {
    return db.cluster.update({
      where: { id: existente.id },
      data: {
        descripcion: descripcionCluster,
        identity_key: identityKey,
        fecha_modificacion: new Date(),
        usuario_modificacion: userId,      // <--- CORRECCIÓN
      },
    })
  }

  // 8. CREATE si es nuevo
  return db.cluster.create({
    data: {
      nombre: nombreCluster,
      descripcion: descripcionCluster,
      cod_tipo_cluster: 'PX',
      estado: 'ACTIVO',

      usuario_creacion: userId,            // <--- CORRECCIÓN
      usuario_modificacion: userId,        // <--- CORRECCIÓN

      identity_key: identityKey,
      id_proxmox_endpoint: endpoint.id,
      fecha_creacion: new Date(),
      fecha_modificacion: new Date(),      // <--- CORRECCIÓN
    },
  })
}
