import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

export const syncClusterNodo = async (endpointId, clusterId, servidor, nodo) => {
  // Usuario actual, o 1 si es scheduler
  const userId = context.currentUser?.id || 1

  const nombreNodo = nodo.node

  // Identity global único e idempotente
  const identityKey = `proxmox-clusternode:${endpointId}:${clusterId}:${nombreNodo}`

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

  const baseData = {
    identity_key: identityKey,
    nombre: nombreNodo,
    nodoTipo: 'FISICO',
    servidorId: servidor.id,
    fecha_modificacion: new Date(),
  }

  // UPDATE
  if (existente) {
    return db.clusterNodo.update({
      where: { id: existente.id },
      data: {
        ...baseData,
        usuario_modificacion: userId, // <--- solo aquí
      },
    })
  }

  // CREATE
  return db.clusterNodo.create({
    data: {
      ...baseData,
      clusterId,
      estado: 'ACTIVO',

      usuario_creacion: userId,  // <--- correcto
      fecha_creacion: new Date(),
    },
  })
}
