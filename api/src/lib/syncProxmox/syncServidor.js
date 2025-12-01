// lib/syncProxmox/syncServidor.js
import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'

/* ============================================
   MAPEO PROXMOX → PARAMETRICAS (BINARIO)
============================================ */
function mapEstadoOperativo(estado) {
  const s = (estado || '').toLowerCase()
  if (['running', 'online'].includes(s)) return 'OPERATIVO'
  return 'FUERA_SERVICIO'
}

/* ============================================
   SINCRONIZAR SERVIDOR FÍSICO (NODO)
============================================ */
export const syncServidor = async (endpointId, nodo) => {
  const userId = context.currentUser?.id || 1

  try {
    const memoria = nodo.mem_total
    const disco = nodo.disk_total

    const identityKey = `proxmox:${endpointId}:node:${nodo.node}`

    // Buscar por identity o por IP
    const existente = await db.servidor.findFirst({
      where: {
        OR: [
          { identity_key: identityKey },
          { ip_primaria: nodo.ip }
        ]
      },
    })

    const estadoOperativo = mapEstadoOperativo(nodo.estado)

    // Datos actualizables SIEMPRE
    const datosTecnicos = {
      ip_primaria: nodo.ip || null,
      ram: memoria ? Math.round(memoria / (1024 ** 3)) : null,
      almacenamiento: disco ? Math.round(disco / (1024 ** 3)) : null,
      estado_operativo: estadoOperativo,

      identity_key: identityKey,
      fecha_modificacion: new Date(),
      usuario_modificacion: userId,    // <--- SE AÑADE
    }

    let servidor = null
    let inserted = false

    if (existente) {
      // UPDATE
      servidor = await db.servidor.update({
        where: { id: existente.id },
        data: datosTecnicos,
      })

    } else {
      // CREATE
      inserted = true
      servidor = await db.servidor.create({
        data: {
          ...datosTecnicos,
          nombre: nodo.node,
          estado: 'ACTIVO',

          usuario_creacion: userId,
          fecha_creacion: new Date(),
        },
      })
    }

    return { servidor, inserted }

  } catch (error) {
    console.error(`[syncServidor] Error sincronizando nodo ${nodo.node}:`, error)
    throw error
  }
}
