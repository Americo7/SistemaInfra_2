// src/lib/syncProxmox/syncServidor.js
import { db } from 'src/lib/db'
import { context } from '@redwoodjs/graphql-server'
import { valkey } from 'src/lib/valkey' // 🟢 Importamos Valkey
import crypto from 'crypto' // 🟢 Para hashing

/* ============================================
   HELPER: HASHING
============================================ */
const generateHash = (data) => crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')

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
    const estadoOperativo = mapEstadoOperativo(nodo.estado)

    // 1. Preparamos los datos Puros (Sin fechas ni IDs de usuario) para el Hash
    // Estos son los datos que definen si el servidor cambió físicamente
    const dataToHash = {
      identity_key: identityKey,
      nombre: nodo.node,
      ip_primaria: nodo.ip || null,
      ram: memoria ? Math.round(memoria / (1024 ** 3)) : null,
      almacenamiento: disco ? Math.round(disco / (1024 ** 3)) : null,
      estado_operativo: estadoOperativo,
    }

    /* -----------------------------------
       🟢 OPTIMIZACIÓN VALKEY
    ----------------------------------- */
    const currentHash = generateHash(dataToHash)
    const cacheKeyHash = `hash:servidor:${identityKey}`
    const cacheKeyMeta = `meta:servidor:${identityKey}` // Guardamos el ID aquí

    // Consultamos Hash y Metadata en paralelo
    const [cachedHash, cachedMetaStr] = await Promise.all([
      valkey.get(cacheKeyHash),
      valkey.get(cacheKeyMeta)
    ])

    // Si el hash coincide Y tenemos el ID en caché, retornamos sin tocar DB
    if (cachedHash === currentHash && cachedMetaStr) {
      const cachedMeta = JSON.parse(cachedMetaStr)
      return { 
        servidor: { id: cachedMeta.id, ...dataToHash }, // Retornamos lo necesario para syncMain
        inserted: false 
      }
    }
    
    /* -----------------------------------
       FIN OPTIMIZACIÓN (Toca DB)
    ----------------------------------- */

    // Buscar por identity o por IP (Lógica Legacy de seguridad)
    const existente = await db.servidor.findFirst({
      where: {
        OR: [
          { identity_key: identityKey },
          { ip_primaria: nodo.ip }
        ]
      },
    })

    // Datos completos para DB (incluyendo traza de usuario y fechas)
    const dbData = {
      ...dataToHash,
      fecha_modificacion: new Date(),
      usuario_modificacion: userId,
    }

    let servidor = null
    let inserted = false

    if (existente) {
      // UPDATE
      servidor = await db.servidor.update({
        where: { id: existente.id },
        data: dbData,
      })

    } else {
      // CREATE
      inserted = true
      servidor = await db.servidor.create({
        data: {
          ...dbData,
          estado: 'ACTIVO',
          usuario_creacion: userId,
          fecha_creacion: new Date(),
        },
      })
    }

    /* -----------------------------------
       🟢 ACTUALIZAR CACHÉ TRAS ÉXITO EN BD
       TTL: 24h
    ----------------------------------- */
    await Promise.all([
      valkey.set(cacheKeyHash, currentHash, 'EX', 86400),
      // Guardamos el ID para poder recuperarlo en la próxima ejecución sin DB
      valkey.set(cacheKeyMeta, JSON.stringify({ id: servidor.id }), 'EX', 86400)
    ])

    return { servidor, inserted }

  } catch (error) {
    console.error(`[syncServidor] Error sincronizando nodo ${nodo.node}:`, error)
    throw error
  }
}