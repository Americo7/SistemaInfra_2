// lib/syncProxmox/syncServidor.js
import { db } from 'src/lib/db'

/* ============================================
   MAPEO PROXMOX → PARAMETRICAS
============================================ */
function mapEstadoOperativo(estado) {
  const s = (estado || '').toLowerCase()
  if (s === 'running' || s === 'online') return 'OPERATIVO'
  if (['stopped', 'shutdown', 'offline'].includes(s)) return 'APAGADO'
  if (['stopping', 'paused'].includes(s)) return 'FUERA_SERVICIO'
  return 'FUERA_SERVICIO'
}

/* ============================================
   SINCRONIZAR SERVIDOR FÍSICO (NODO)
============================================ */
export const syncServidor = async (endpointId, nodo) => {
  const memoria = nodo.mem_total
  const disco = nodo.disk_total
  
  // Generamos el ID único basado en Proxmox
  const identityKey = `proxmox:${endpointId}:node:${nodo.node}`

  // 1. CORRECCIÓN DE BÚSQUEDA:
  // Buscamos por identity_key (preferido) o por IP. 
  // NUNCA por nombre, porque tú vas a cambiar el nombre manualmente.
  let existente = await db.servidor.findFirst({
    where: {
      OR: [
        { identity_key: identityKey },
        { ip_primaria: nodo.ip } // Fallback por si la key no existía
      ]
    },
  })

  const estadoOperativo = mapEstadoOperativo(nodo.estado)

  const updateData = {
    ip_primaria: nodo.ip || null,
    ram: memoria ? Math.round(memoria / 1024 ** 3) : null,
    almacenamiento: disco ? Math.round(disco / 1024 ** 3) : null,
    estado_operativo: estadoOperativo,
    fecha_modificacion: new Date(),
    // IMPORTANTE: Aseguramos que el identity_key esté actualizado si lo encontró por IP
    identity_key: identityKey 
  }

  // No sobrescribir inventario manual
  if (!existente?.marca) updateData.marca = null
  if (!existente?.modelo) updateData.modelo = null
  if (!existente?.serie) updateData.serie = null
  if (!existente?.cod_tipo_servidor) updateData.cod_tipo_servidor = null

  // 2. CORRECCIÓN DE NOMBRE:
  // Eliminamos la línea "updateData.nombre = nodo.node" de aquí.
  // Así, si ya existe, respeta el nombre que tú le pusiste (ej. SR-01DS).

  let inserted = false
  let servidor = null

  if (existente) {
    servidor = await db.servidor.update({
      where: { id: existente.id },
      data: updateData, // Aquí YA NO va el nombre, solo RAM, Disco, Estado, etc.
    })
  } else {
    inserted = true
    // Solo asignamos el nombre del nodo si estamos CREANDO uno nuevo
    servidor = await db.servidor.create({
      data: {
        ...updateData,
        nombre: nodo.node, // Solo aquí se usa el nombre técnico inicial
        estado: 'ACTIVO',
        usuario_creacion: 1,
        fecha_creacion: new Date(),
      },
    })
  }

  return { servidor, inserted }
}