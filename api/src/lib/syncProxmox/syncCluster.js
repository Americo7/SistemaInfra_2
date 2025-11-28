// lib/syncProxmox/syncCluster.js
import { db } from 'src/lib/db'
import { getProxmoxClient } from '../proxmox/client'
import { cacheFetch } from '../proxmox/cache'

export const syncCluster = async (endpoint) => {
  const client = await getProxmoxClient(endpoint.id)

  // 1) /cluster/status con caché
  const items = await cacheFetch(
    `px:${endpoint.id}:cluster:status`,
    10,
    async () => {
      const res = await client.get('/cluster/status')
      return res.data?.data || []
    }
  )

  // 2) Detectar cluster real o standalone
  const realCluster = items.find((i) => i.type === 'cluster')

  const nombreCluster = realCluster
    ? realCluster.name
    : `${endpoint.nombre}-STANDALONE`

  const descripcionCluster = realCluster
    ? `Cluster Proxmox (${nombreCluster})`
    : `Proxmox standalone en ${endpoint.nombre}`

  // 3) identity_key estable y global
  const identityKey = `proxmox-cluster:${endpoint.id}:${nombreCluster}`

  // 4) Buscar primero por identity_key
  let existente = await db.cluster.findUnique({
    where: { identity_key: identityKey },
  })

  // Fallback: regla antigua unique(nombre, id_proxmox_endpoint)
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

  // 5) UPDATE si existe
  if (existente) {
    return db.cluster.update({
      where: { id: existente.id },
      data: {
        descripcion: descripcionCluster,
        identity_key: identityKey,
        fecha_modificacion: new Date(),
      },
    })
  }

  // 6) CREATE si es nuevo
  return db.cluster.create({
    data: {
      nombre: nombreCluster,
      descripcion: descripcionCluster,
      cod_tipo_cluster: 'PX',
      estado: 'ACTIVO',
      usuario_creacion: 1,
      identity_key: identityKey,
      id_proxmox_endpoint: endpoint.id,
      fecha_creacion: new Date(),
    },
  })
}
