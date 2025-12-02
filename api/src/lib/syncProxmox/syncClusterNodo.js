// lib/syncProxmox/syncClusterNodo.js
import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'
import { valkey } from 'src/lib/valkey' // 🟢 Importamos Valkey
import crypto from 'crypto' // 🟢 Para hashing

// Helper para hash MD5
const generateHash = (data) => crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')

export const syncClusterNodo = async (endpointId, clusterId, servidor, nodo) => {
  // Usuario actual, o 1 si es scheduler
  const userId = context.currentUser?.id || 1
  const nombreNodo = nodo.node

  // Identity global único e idempotente
  const identityKey = `proxmox-clusternode:${endpointId}:${clusterId}:${nombreNodo}`

  // 1) Preparamos Datos Base para el Hash (Datos que definen la relación)
  const dataToHash = {
    identity_key: identityKey,
    nombre: nombreNodo,
    nodoTipo: 'FISICO',
    servidorId: servidor.id,
    clusterId: clusterId
  }

  /* -----------------------------------
     🟢 OPTIMIZACIÓN VALKEY (Hashing)
  ----------------------------------- */
  const cacheKey = `hash:clusternode:${identityKey}`
  const currentHash = generateHash(dataToHash)
  
  // Verificamos caché
  const cachedHash = await valkey.get(cacheKey)

  if (cachedHash === currentHash) {
    // Si no cambió nada, retornamos sin tocar Postgres
    return { 
      id: 0, // No necesitamos el ID real para el flujo actual
      ...dataToHash, 
      cached: true 
    }
  }
  /* -----------------------------------
     FIN OPTIMIZACIÓN
  ----------------------------------- */

  // Buscar por identity_key
  let existente = await db.clusterNodo.findUnique({
    where: { identity_key: identityKey },
  })

  // Fallback: match antiguo por (clusterId + nombre)
  if (!existente) {
    existente = await db.clusterNodo.findFirst({
      where: {
        clusterId,
        nombre: nombreNodo,
      },
    })
  }

  const dbData = {
    ...dataToHash,
    fecha_modificacion: new Date(),
  }

  let result

  // UPDATE
  if (existente) {
    result = await db.clusterNodo.update({
      where: { id: existente.id },
      data: {
        ...dbData,
        usuario_modificacion: userId,
      },
    })
  } else {
    // CREATE
    result = await db.clusterNodo.create({
      data: {
        ...dbData,
        estado: 'ACTIVO',
        usuario_creacion: userId,
        fecha_creacion: new Date(),
      },
    })
  }

  /* -----------------------------------
     🟢 ACTUALIZAR VALKEY
     TTL: 24h
  ----------------------------------- */
  await valkey.set(cacheKey, currentHash, 'EX', 86400)

  return result
}