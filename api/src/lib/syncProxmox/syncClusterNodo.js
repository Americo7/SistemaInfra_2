// lib/syncProxmox/syncClusterNodo.js
import { db } from 'src/lib/db'

export const syncClusterNodo = async (endpointId, clusterId, servidor, nodo) => {
  const nombreNodo = nodo.node

  // Identidad global estable
  const identityKey = `proxmox-clusternode:${endpointId}:${clusterId}:${nombreNodo}`

  // 1) Buscar por identity_key (nuevo sistema)
  let existente = await db.clusterNodo.findUnique({
    where: { identity_key: identityKey },
  })

  // 2) Fallback para registros antiguos (clusterId + nombre)
  //    Debe usarse findFirst, no findUnique (ya NO existe unique compuesto)
  if (!existente) {
    existente = await db.clusterNodo.findFirst({
      where: {
        clusterId,
        nombre: nombreNodo,
      },
    })
  }

  // Datos comunes para update/create
  const baseData = {
    identity_key: identityKey,
    nombre: nombreNodo,
    nodoTipo: 'FISICO',
    servidorId: servidor.id,
    fecha_modificacion: new Date(),
  }

  // 3) UPDATE si existe
  if (existente) {
    return db.clusterNodo.update({
      where: { id: existente.id },
      data: baseData,
    })
  }

  // 4) CREATE si no existe
  return db.clusterNodo.create({
    data: {
      ...baseData,
      clusterId,
      estado: 'ACTIVO',
      usuario_creacion: 1,
      fecha_creacion: new Date(),
    },
  })
}
