// src/lib/syncK8s/syncCluster.js
import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'
import { valkey } from 'src/lib/valkey' // 🟢 Importamos Valkey
import crypto from 'crypto' // 🟢 Para hashing

// Helper para generar hash MD5
const generateHash = (data) => crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')

export const syncCluster = async (endpoint) => {
  // 1. Obtener usuario actual (Scheduler → 1, Usuario real → su ID)
  const userId = context.currentUser?.id || 1

  // 2. Identity key única e idempotente
  const identity_key = `k8s:${endpoint.id}`

  // 3. Datos base que definen el cluster (sin fechas)
  const dataToHash = {
    nombre: endpoint.nombre,
    cod_tipo_cluster: 'K8S',
    descripcion: `Cluster sincronizado desde ${endpoint.url_api}`,
    id_k8s_endpoint: endpoint.id,
    estado: 'ACTIVO',
  }

  /* -----------------------------------
     🟢 OPTIMIZACIÓN VALKEY
  ----------------------------------- */
  const currentHash = generateHash(dataToHash)
  const dbCacheKey = `hash:k8s:cluster:${identity_key}`
  const metaCacheKey = `meta:k8s:cluster:${identity_key}` // Guardamos ID

  // Consultamos Hash y ID en paralelo
  const [cachedDbHash, cachedMetaId] = await Promise.all([
    valkey.get(dbCacheKey),
    valkey.get(metaCacheKey)
  ])

  // Si el hash coincide y tenemos el ID, retornamos el objeto "virtual"
  if (cachedDbHash === currentHash && cachedMetaId) {
    return {
      id: Number(cachedMetaId), // Convertir a número por seguridad
      ...dataToHash,
      cached: true
    }
  }
  /* -----------------------------------
     FIN OPTIMIZACIÓN
  ----------------------------------- */

  // 4. UPSERT completo con auditoría
  const result = await db.cluster.upsert({
    where: { identity_key },

    create: {
      ...dataToHash,
      identity_key,

      usuario_creacion: userId,
      usuario_modificacion: userId,
      fecha_creacion: new Date(),
      fecha_modificacion: new Date(), // Es buena práctica inicializarla también
    },

    update: {
      ...dataToHash,
      fecha_modificacion: new Date(),
      usuario_modificacion: userId,
    },
  })

  /* -----------------------------------
     🟢 ACTUALIZAR CACHÉ
     TTL: 24 horas
  ----------------------------------- */
  await Promise.all([
    valkey.set(dbCacheKey, currentHash, 'EX', 86400),
    valkey.set(metaCacheKey, result.id, 'EX', 86400)
  ])

  return result
}