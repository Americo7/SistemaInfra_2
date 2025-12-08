// lib/syncProxmox/syncCluster.js
import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'
import { getProxmoxClient } from '../proxmox/client'
import { valkey } from 'src/lib/valkey' // 🟢 Importamos Valkey
import crypto from 'crypto' // 🟢 Para hashing

// Helper
const generateHash = (data) => crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')

export const syncCluster = async (endpoint) => {
  // 1. OBTENER USUARIO (si no hay sesión → 1)
  const userId = context.currentUser?.id || 1

  const client = await getProxmoxClient(endpoint.id)

  /* -----------------------------------
     🟢 2. API CACHING CON VALKEY (Reemplazo de cacheFetch)
  ----------------------------------- */
  const apiCacheKey = `px:${endpoint.id}:cluster:status`
  let items = []
  
  // Intentar leer de cache
  const cachedApiRes = await valkey.get(apiCacheKey)

  if (cachedApiRes) {
    items = JSON.parse(cachedApiRes)
  } else {
    // Si no está, consultar API
    try {
      const res = await client.get('/cluster/status')
      items = res.data?.data || []
      // Guardar en cache por 60 segundos (TTL corto para datos de estado)
      await valkey.set(apiCacheKey, JSON.stringify(items), 'EX', 60)
    } catch (e) {
      console.warn('No se pudo obtener cluster status, asumiendo standalone o error', e.message)
      items = []
    }
  }

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

  // Datos base para hash (lo que define al cluster)
  const dataToHash = {
    nombre: nombreCluster,
    descripcion: descripcionCluster,
    identity_key: identityKey,
    id_proxmox_endpoint: endpoint.id,
    cod_tipo_cluster: 'PXM',
  }

  /* -----------------------------------
     🟢 OPTIMIZACIÓN DB (Hashing + MetaID)
  ----------------------------------- */
  const currentHash = generateHash(dataToHash)
  const dbCacheKey = `hash:cluster:${identityKey}`
  const metaCacheKey = `meta:cluster:${identityKey}` // Para guardar el ID

  const [cachedDbHash, cachedMetaId] = await Promise.all([
    valkey.get(dbCacheKey),
    valkey.get(metaCacheKey)
  ])

  // Si no hay cambios y tenemos el ID, retornamos rápido
  if (cachedDbHash === currentHash && cachedMetaId) {
    return {
      id: Number(cachedMetaId), // Importante parsear a Number si es int en DB
      ...dataToHash,
      cached: true
    }
  }
  /* -----------------------------------
     FIN OPTIMIZACIÓN
  ----------------------------------- */

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

  const dbData = {
    ...dataToHash,
    estado: 'ACTIVO',
    fecha_modificacion: new Date(),
  }

  let result

  // 7. UPDATE si existe
  if (existente) {
    result = await db.cluster.update({
      where: { id: existente.id },
      data: {
        ...dbData,
        usuario_modificacion: userId,
      },
    })
  } else {
    // 8. CREATE si es nuevo
    result = await db.cluster.create({
      data: {
        ...dbData,
        usuario_creacion: userId,
        fecha_creacion: new Date(),
      },
    })
  }

  /* -----------------------------------
     🟢 ACTUALIZAR CACHÉ DB
     TTL: 24h
  ----------------------------------- */
  await Promise.all([
    valkey.set(dbCacheKey, currentHash, 'EX', 86400),
    valkey.set(metaCacheKey, result.id, 'EX', 86400) // Guardamos ID para la próxima
  ])

  return result
}